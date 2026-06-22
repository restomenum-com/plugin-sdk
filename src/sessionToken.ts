// iframe Custom UI — App Bridge session token doğrulama (JWT HS256, sıfır bağımlılık: node:crypto).
//
// Custom UI sayfan Restomenum panelinde iframe olarak açılır. Frontend, App Bridge'den kısa-ömürlü bir
// session token alır ve BACKEND'ine taşır:
//   const { data } = await bridge.call('getSessionToken');   // iframe (frontend)
//   fetch('/api/me', { headers: { Authorization: 'Bearer ' + data.token } });
// Backend bu token'ı tenant'ın webhookSecret'ı ile doğrular → hangi tenant + kullanıcı baktığını öğrenir.
//
// Token şeması: base64url(header).base64url(payload).base64url(HMAC_SHA256(webhookSecret,"header.payload"))
// İmza anahtarı webhook ile AYNI gizdir (webhookSecret); format JWT'dir (webhook = X-Restomenum-Signature header).
// Kontroller production örneğiyle (kurye-eklentisi lib/jwt.ts) hizalı: alg=HS256 (alg-confusion/"none" reddi),
// iss=restomenum, aud=pluginId (cross-plugin token reddi), HMAC imza (timing-safe), exp ZORUNLU, iat ileri-tarih reddi.
import crypto from 'node:crypto';
import { SessionError } from './errors.js';

/** App Bridge session token claim'leri (Restomenum HS256 ile imzalar; aud = pluginId). */
export interface SessionTokenClaims {
  /** Issuer — her zaman "restomenum". */
  iss: string;
  /** Audience — bu eklentinin pluginId'si (doğrulama ZORUNLU). */
  aud: string;
  /** Subject — iframe'i açan kullanıcının userId'si. */
  sub: string;
  /** Kullanıcı rolü — per-user yetki bununla kurulur. */
  role: 'manager' | 'staff';
  /** Hangi tenant'ın baktığı (kanonik kimlik). */
  tenantId: string;
  /** Eklenti kimliği (aud ile aynı). */
  pluginId: string;
  /** Issued-at (unix saniye). */
  iat: number;
  /** Expiry (unix saniye) — token kısa ömürlüdür. */
  exp: number;
  /** İleriye dönük claim'ler — tanımadığını yok say. */
  [extra: string]: unknown;
}

export interface VerifySessionOptions {
  /** Bu eklentinin pluginId'si — token.aud bununla eşleşmeli (başka eklentinin token'ı reddedilir). ZORUNLU. */
  pluginId: string;
  /**
   * İmza anahtarını token'ın tenantId'sinden çöz (install store'dan; senkron veya async).
   * `webhookSecret` ile birlikte verilmezse ZORUNLU. Anahtar imzadan ÖNCE seçilir (kid paterni) ama imza
   * yine doğrulanır → sahte tenantId ile başka tenant'ın secret'ı çözülse bile imza tutmaz (güvenli).
   */
  getSecret?: (tenantId: string) => string | null | undefined | Promise<string | null | undefined>;
  /** Anahtarı doğrudan ver (tek-tenant / önceden çözülmüşse) — `getSecret` yerine. */
  webhookSecret?: string;
  /** Beklenen issuer. Varsayılan "restomenum". */
  issuer?: string;
  /** iat ileri-tarih toleransı (saniye, saat kayması için). Varsayılan 60. */
  clockToleranceSec?: number;
}

/**
 * iframe App Bridge session token'ını doğrula → güvenilir {@link SessionTokenClaims}.
 * "Bearer " öneki (varsa) atılır. Her istekte BACKEND'de doğrula — iframe'e güvenme.
 * Başarısızlıkta {@link SessionError} fırlatır (`reason` ile ayırt edilir).
 *
 * @example
 * const claims = await verifySessionToken(req.headers.authorization, {
 *   pluginId,
 *   getSecret: (tenantId) => installStore.find(tenantId)?.webhookSecret,
 * });
 * // claims.tenantId · claims.sub (userId) · claims.role (manager|staff)
 */
export async function verifySessionToken(
  token: string | null | undefined,
  options: VerifySessionOptions,
): Promise<SessionTokenClaims> {
  const { pluginId, getSecret, webhookSecret, issuer = 'restomenum', clockToleranceSec = 60 } = options;

  const jwt = (token ?? '').replace(/^Bearer\s+/i, '').trim();
  const parts = jwt.split('.');
  if (parts.length !== 3) throw new SessionError('malformed', 'JWT 3 parça (header.payload.signature) olmalı');
  const [headerB64, payloadB64, sigB64] = parts as [string, string, string];

  // alg ucuz kontrol — anahtara dokunmadan alg-confusion / "none" reddi.
  const header = decodeJson(headerB64);
  if (!header || header.alg !== 'HS256') throw new SessionError('wrong_algorithm', 'alg HS256 olmalı');

  const claims = decodeJson(payloadB64);
  if (!claims) throw new SessionError('malformed', 'payload JSON değil');
  // İmzadan ÖNCE ucuz claim kontrolleri (iss/aud) + anahtar çözümü için tenantId — imza yine doğrulanır.
  if (claims.iss !== issuer) throw new SessionError('invalid_issuer', `iss "${issuer}" olmalı`);
  if (claims.aud !== pluginId) throw new SessionError('audience_mismatch', 'aud = pluginId olmalı');
  const tenantId = claims.tenantId;
  if (typeof tenantId !== 'string' || !tenantId) throw new SessionError('malformed', 'tenantId yok');

  // İmza anahtarını çöz: doğrudan webhookSecret VEYA tenantId'den getSecret.
  const secret = webhookSecret ?? (getSecret ? await getSecret(tenantId) : undefined);
  if (!secret) throw new SessionError('invalid_signature', 'webhookSecret çözülemedi (getSecret/webhookSecret?)');

  // İmza: HMAC_SHA256(secret, "header.payload") — timing-safe karşılaştır.
  const expected = crypto.createHmac('sha256', secret).update(`${headerB64}.${payloadB64}`).digest();
  const actual = b64urlToBuf(sigB64);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    throw new SessionError('invalid_signature');
  }

  const now = Math.floor(Date.now() / 1000);
  // exp ZORUNLU — exp'siz token = kalıcı kredensiyel → red. Süresi geçmişse red.
  if (typeof claims.exp !== 'number' || now > claims.exp) throw new SessionError('expired', 'token süresi doldu (veya exp yok)');
  // iat ileri-tarihli olamaz (saat kayması toleransı kadar).
  if (typeof claims.iat === 'number' && claims.iat - now > clockToleranceSec) throw new SessionError('not_yet_valid', 'iat ileri-tarihli');

  return claims as unknown as SessionTokenClaims;
}

function decodeJson(b64url: string): Record<string, unknown> | null {
  try {
    return JSON.parse(b64urlToBuf(b64url).toString('utf8'));
  } catch {
    return null;
  }
}

function b64urlToBuf(b64url: string): Buffer {
  return Buffer.from(b64url.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}
