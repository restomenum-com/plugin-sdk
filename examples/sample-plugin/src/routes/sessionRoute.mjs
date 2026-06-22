// GET /api/me — iframe Custom UI session token doğrulama (App Bridge).
// Custom UI sayfan Restomenum panelinde iframe açılır; frontend App Bridge'den kısa-ömürlü token alıp
// backend'ine taşır:
//   const { data } = await bridge.call('getSessionToken');           // iframe (frontend)
//   const me = await fetch('/api/me', { headers: { Authorization: 'Bearer ' + data.token } });
// Backend token'ı SDK verifySessionToken ile doğrular → hangi tenant + kullanıcı baktığını GÜVENLE öğrenir.
// İmza/kripto SDK'da (kendin yazma); anahtar = tenant'ın webhookSecret'ı (token exchange'ten, InstallStore'da).
// Adımlar: oku (header) → doğrula (SDK) → tenant-scoped yanıt (lib/http).
import { verifySessionToken, SessionError } from '@restomenum/plugin-sdk';
import { sendJson } from '../lib/http.mjs';

export function makeSessionRoute({ installStore, pluginId }) {
  return async function sessionRoute(req, res) {
    let claims;
    try {
      // SDK: aud=pluginId + iss=restomenum + HMAC(webhookSecret) + exp/iat'i doğrular; tenantId'den secret çözer.
      claims = await verifySessionToken(req.headers['authorization'], {
        pluginId,
        getSecret: (tenantId) => installStore.find(tenantId)?.webhookSecret,
      });
    } catch (error) {
      // Geçersiz/eksik/bayat token → 401 (reason ile; gövdeyi/iç hatayı sızdırma).
      if (error instanceof SessionError) return sendJson(res, 401, { error: 'invalid_session', reason: error.reason });
      throw error; // beklenmeyen → server 500 (router yakalar)
    }

    // claims GÜVENİLİR: tenantId (hangi tenant) · sub (userId) · role (manager|staff).
    // Per-user yetkiyi role ile kur; kullanıcı adı/PII için users/get (users:read + consent).
    console.log(`/api/me: tenant=${claims.tenantId} user=${claims.sub} role=${claims.role}`);
    return sendJson(res, 200, { tenantId: claims.tenantId, userId: claims.sub, role: claims.role });
  };
}
