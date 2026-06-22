# @restomenum/plugin-sdk

Restomenum eklenti platformu için resmi **TypeScript** geliştirici SDK'sı. Webhook imza doğrulama,
OAuth token exchange, tipli Callback API istemcisi, event/scope katalogu ve tipler — tek pakette.

> Node **20+** (global `fetch`). Sıfır runtime bağımlılığı (yalnız `node:crypto`).

## Kurulum
```bash
npm install @restomenum/plugin-sdk
```

## Webhook imza doğrulama
İmza **ham gövde** üzerinden doğrulanır (JSON.parse edilmiş değil), ±5 dk replay penceresi, timing-safe.
```ts
import { verifyWebhookSignature } from '@restomenum/plugin-sdk';

// Express (ham gövdeyi sakla: app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf } })))
const ok = verifyWebhookSignature(req.rawBody.toString('utf8'), req.headers['x-restomenum-signature'], webhookSecret);
if (!ok) return res.status(401).json({ error: 'invalid_signature' });
```

### Express middleware (hazır)
```ts
import { expressWebhook } from '@restomenum/plugin-sdk';

app.post('/webhook', express.json({ verify: (req, _r, buf) => { (req as any).rawBody = buf; } }),
  expressWebhook(
    { getSecret: (tenantId) => store.webhookSecretFor(tenantId) },   // senkron/async
    async (envelope) => {
      // imza + şekil doğrulandı; envelope = { id, type, tenantId, occurredAt, data }
      if (envelope.type === 'table.created') await handle(envelope.data);
      // yanıt yazmazsan otomatik 200 { ok:true }
    },
  ),
);
```

## OAuth token exchange
```ts
import { exchangeCode } from '@restomenum/plugin-sdk';

const cred = await exchangeCode(
  { code, clientId, clientSecret },
  { environment: 'sandbox' }, // veya { baseUrl }
);
// cred = { tenantId, apiKey, webhookSecret, scopes }  → tenant başına SAKLA
```

## Callback API istemcisi (tipli)
```ts
import { RestomenumClient } from '@restomenum/plugin-sdk';

const client = new RestomenumClient({ apiKey: cred.apiKey, environment: 'production' });

const packets = await client.packets.open();
const packet  = await client.packets.get('packetId');
const products = await client.products.list();          // { data, truncated?, total? }
const customer = await client.customers.get('custId');  // PII consent kuralı sunucuda uygulanır

// Müşteri listesi — cursor pagination (offset YOK):
for await (const c of client.customers.listAll(200)) {
  // tüm müşteriler, sayfa sayfa otomatik
}
```
Kaynak grupları: `packets`, `tables`, `products`, `categories`, `paymentMethods`, `ingredients`, `users`, `customers`.

### Hata yönetimi
REST hata kodları `ApiError`'a çevrilir; OAuth hataları `OAuthError`; imza `SignatureError`.
```ts
import { ApiError } from '@restomenum/plugin-sdk';
try {
  await client.packets.get('yok');
} catch (e) {
  if (e instanceof ApiError) {
    console.log(e.status, e.code);          // 404, "plugin.packets.notFound"
    if (e.status === 429) wait(e.retryAfterSec); // Retry-After (sn)
  }
}
```

## Action (buton/hook) yanıtı
```ts
import { actionResponse } from '@restomenum/plugin-sdk';
res.json(actionResponse(true, 'İşlem tamam', { level: 'success', display: 'toast' }));
```

## Session Token (iframe Custom UI)
Custom UI sayfan Restomenum panelinde iframe olarak açılır. Frontend App Bridge'den kısa-ömürlü bir
session token alır ve **backend'ine** taşır; backend `verifySessionToken` ile doğrular → hangi tenant +
kullanıcının baktığını güvenle öğrenir. Token JWT HS256'dır, tenant'ın **`webhookSecret`**'ı ile imzalı,
`aud = pluginId`.

```ts
// iframe (frontend) — App Bridge ile token al, backend'ine taşı:
//   const { data } = await bridgeCall('getSessionToken');   // data = { token, tokenType:"Bearer", expiresIn:120 }
//   fetch('/api/me', { headers: { Authorization: 'Bearer ' + data.token } });

// backend — SDK ile doğrula (imza/kripto SDK'da; kendin yazma):
import { verifySessionToken, SessionError } from '@restomenum/plugin-sdk';

try {
  const claims = await verifySessionToken(req.headers.authorization, {
    pluginId,                                                  // aud bununla eşleşmeli (cross-plugin reddi)
    getSecret: (tenantId) => installStore.find(tenantId)?.webhookSecret,
  });
  // claims.tenantId · claims.sub (userId) · claims.role ('manager' | 'staff')
} catch (e) {
  if (e instanceof SessionError) res.status(401).json({ error: e.reason }); // malformed | wrong_algorithm | invalid_issuer | audience_mismatch | invalid_signature | expired | not_yet_valid
}
```
Doğrular: `alg=HS256` (alg-confusion/"none" reddi) · `iss=restomenum` · `aud=pluginId` · HMAC imza (timing-safe) ·
`exp` ZORUNLU (exp'siz/expired red) · `iat` ileri-tarih reddi. Token kısa ömürlü → **her isteği backend'de** doğrula.
Tam örnek: [`examples/sample-plugin`](https://github.com/restomenum-com/plugin-sdk/tree/main/examples/sample-plugin) `/ui` + `/api/me`.

## Katalog & tipler
```ts
import { EVENT_TYPES, SCOPES, PII_SCOPES, isPiiScope, isEventType } from '@restomenum/plugin-sdk';
import type { EventType, Scope, WebhookEnvelope, Customer, Packet, ActionRequest } from '@restomenum/plugin-sdk';
import type { SessionTokenClaims } from '@restomenum/plugin-sdk';
```

## İlgili
- Dokümanlar: https://dev.restomenum.com/docs
- OpenAPI spec: https://dev.restomenum.com/openapi.json
- Örnek eklenti (starter): [`examples/sample-plugin`](https://github.com/restomenum-com/plugin-sdk/tree/main/examples/sample-plugin) — bu repo içinde, SDK'yı uçtan uca kullanır
