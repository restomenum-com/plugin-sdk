// POST /webhook — event + lifecycle alıcısı.
// SDK verifyAndParseWebhook: ham gövde + imza header + tenant secret → doğrulanmış envelope ya da null (→401).
// Adımlar: ham gövde oku → SDK doğrula+parse → dedup → tipine göre handler'a yönlendir (src/events) → 2xx.
import { verifyAndParseWebhook, RestomenumClient } from '@restomenum/plugin-sdk';
import { readRawBody, sendJson } from '../lib/http.mjs';
import { dispatchEvent } from '../events/index.mjs';

export function makeWebhookRoute({ installStore, seenEventStore, restomenumBase }) {
  return async function webhookRoute(req, res) {
    let rawBody;
    try {
      rawBody = await readRawBody(req, res); // boyut tavanını aşarsa 413 yazıp reject eder
    } catch {
      return; // yanıt zaten yazıldı (413) / transport hatası
    }

    // SDK tek adımda: parse (tenantId için) → getSecret(tenantId) → HMAC doğrula (ham gövde, ±5 dk, timing-safe).
    // null → şekil/imza geçersiz → 401 (parse detayını imzasız çağırana sızdırma).
    const envelope = await verifyAndParseWebhook(rawBody, req.headers['x-restomenum-signature'], {
      getSecret: (tenantId) => installStore.find(tenantId)?.webhookSecret,
    });
    if (!envelope) return sendJson(res, 401, { error: 'invalid_signature' });

    // Idempotency: aynı envelope.id tekrar gelebilir → bir kez işle.
    if (seenEventStore.has(envelope.id)) return sendJson(res, 200, { ok: true, dedup: true });

    // Handler bağlamı: kurulumun apiKey'iyle Callback API istemcisi (etkileşim yalnız id taşır → dolu veriyi handler buradan çeker).
    const install = installStore.find(envelope.tenantId);
    const client = install?.apiKey ? new RestomenumClient({ apiKey: install.apiKey, baseUrl: restomenumBase }) : undefined;

    // Event'i tipine göre ilgili handler'a yönlendir (src/events/<kaynak>/<event>.mjs). İŞLE ÖNCE.
    // Handler hata fırlatırsa server 500 döner ve seen İŞARETLENMEZ → at-least-once redelivery dedup'a takılmaz.
    await dispatchEvent(envelope, { client, install, log: (m) => console.log(`  ${m}`) });
    seenEventStore.add(envelope.id);

    sendJson(res, 200, { ok: true });
  };
}
