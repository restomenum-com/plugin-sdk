# Restomenum — Örnek Eklenti (starter)

Çalışan eklenti iskeleti — protokol işini **resmi [`@restomenum/plugin-sdk`](https://www.npmjs.com/package/@restomenum/plugin-sdk)**
yapar (webhook imza doğrulama, OAuth token exchange, Callback API istemcisi, event/scope katalogu, modeller).
Uçtan uca akışı gösterir: **Connect → token exchange → webhook (imza doğrulama) → senkron aksiyon**.
Profesyonel katmanlı yapı (routes / lib / store) — klonla, referans al, kendi eklentine başla.

> Öğretici amaçlıdır. Üretimde: credential'ları gerçek DB'de sakla, ağır işi kuyruğa al, idempotency'i
> kalıcı + TTL'li tut, hata/retry yönetimi ekle. Güvenlik-kritik protokol (imza/OAuth) **SDK'da** — kendin yazma.

## Gereksinim
- Node **20+** (`--env-file` ve global `fetch` için)
- `npm install` (tek bağımlılık: `@restomenum/plugin-sdk`)
- Portal'da bir eklenti + **Client Secret** (portal → eklenti → "Client Secret üret")
- Yerelde test için bir **https tünel** (ngrok / cloudflared) — Restomenum webhook'ları https ister ve
  `webhookUrl`/`connectUrl` manifest'te **aynı registered domain** olmalı.

## Hızlı başlangıç
```bash
npm install                   # @restomenum/plugin-sdk
cp .env.example .env          # CLIENT_ID, CLIENT_SECRET, PUBLIC_URL doldur
cloudflared tunnel --url http://localhost:3000   # → https://....trycloudflare.com  (PUBLIC_URL'e yaz)
npm start                     # = node --env-file=.env src/index.mjs
```
Sonra eklentini bir **test mağazasına kur** (portal → Test Mağazaları). Kurulumda Restomenum tarayıcıyı
senin `connectUrl`'ine (`/connect`) `?code=&state=` ile yönlendirir; sunucu code'u credential'a çevirir.

## Proje yapısı
Protokol primitifleri **SDK'dan** gelir (imza, OAuth exchange, Callback API, envelope/model). Bu repo yalnız
**uygulamaya özel glue**'yu tutar: ince router, route handler'ları, http I/O, CSRF state, depo.
```
src/
├── index.mjs              # entry — bootstrap (config + DI + server başlat)
├── config.mjs            # ortam değişkenleri (tek kaynak; base = SDK BASES)
├── server.mjs            # ince router (isteği route'a yönlendirir)
├── routes/               # her endpoint ayrı dosya (ince handler — SDK'yı çağırır)
│   ├── connectRoute.mjs  # SDK exchangeCode + RestomenumClient
│   ├── webhookRoute.mjs  # SDK verifyAndParseWebhook → events/ dispatcher
│   ├── actionRoute.mjs   # SDK verifyWebhookSignature + actionResponse
│   ├── sessionRoute.mjs  # GET /api/me — SDK verifySessionToken (iframe session token)
│   └── uiRoute.mjs       # GET /ui — Custom UI iframe sayfası (App Bridge → /api/me)
├── events/               # HER EVENT için bir handler dosyası (kullanım örneği) — 34 event
│   ├── index.mjs         # dispatcher: event tipi → handler (webhookRoute kullanır)
│   ├── lifecycle/        # app.installed/uninstalled · subscription.* · delivery.* · customer.redact (abonelik gerekmez)
│   ├── packets/          # packetCreated.mjs · packetClosed.mjs
│   ├── purchases/        # purchaseGranted.mjs (IAP — erişim aç)
│   ├── tables/ · products/ · categories/ · customers/ · users/ · paymentMethods/ · ingredients/
├── api/                  # HER Callback API ucu için bir örnek fonksiyon — 35 uç
│   ├── index.mjs         # barrel: api.packets.getPacket(client, id) … (SDK client yapısını aynalar)
│   ├── purchases/        # createPurchase · getPurchase · listPurchases (IAP)
│   ├── packets/ · tables/ · products/ · categories/ · customers/ · users/ · paymentMethods/ · ingredients/
├── lib/                  # uygulama I/O yardımcıları (SDK kapsamı dışı)
│   ├── http.mjs          # readRawBody / sendJson / sendHtml
│   └── state.mjs         # OAuth Connect CSRF state (stub — üretimde gerçek depo)
└── store/                # repository (demo: bellek; gerçek: DB)
    ├── InstallStore.mjs  # SDK InstallCredentials saklar (tenantId → credential)
    └── SeenEventStore.mjs
```

## SDK kullanımı (bu sample'da)
| SDK sembolü | Nerede | İş |
|----|----|----|
| `exchangeCode()` | connectRoute | tek-kullanımlık code → `InstallCredentials` |
| `RestomenumClient` | connectRoute | Callback API (`client.packets.open()` …) |
| `verifyAndParseWebhook()` | webhookRoute | parse + tenant secret + HMAC doğrula → envelope \| null |
| `verifyWebhookSignature()` | actionRoute | action aynı imza şemasını doğrular |
| `actionResponse()` | actionRoute | `{ success, message, level, display }` kurar |
| `verifySessionToken()` | sessionRoute | iframe App Bridge session token doğrula → `{ tenantId, sub(userId), role }` |
| `BASES` | config | sandbox/production kökü |

Kurulum: `npm i @restomenum/plugin-sdk` · Dokümanlar: https://dev.restomenum.com/docs

## Kullanım örnekleri — her event + her API ucu (`events/` + `api/`)
Referans olması için **her webhook event'i** ve **her Callback API ucu** ayrı bir dosyada örneklenir
(tek dosya = tek iş). Gövde/alan adları gerçek payload'lardan; ihtiyacın olanı kopyala-uyarla.

- **`src/events/<kaynak>/<event>.mjs`** — bir webhook event'inin handler'ı (`on<Event>(envelope, ctx)`).
  Gerçek `envelope.data` alanlarını işler; istersen `ctx.client` (Callback API) ile zenginleştirir.
  `src/events/index.mjs` dispatcher'ı tipe göre çağırır; **webhookRoute** doğrulanmış her event'i buraya yönlendirir.
  Yeni event'e abone olmak: manifest `events[]`'e ekle + ilgili handler'ı doldur.
- **`src/api/<kaynak>/<fn>.mjs`** — bir Callback API ucunun örnek çağrısı (`<fn>(client, …)`).
  SDK `RestomenumClient` ile çağırır, gerçek yanıtı işler (write uçlarında gövde docs'tan).
  `src/api/index.mjs` hepsini gruplar: `api.packets.getPacket(client, packetId)`, `api.customers.listCustomers(client)` …

```js
// Event handler (webhookRoute → dispatcher otomatik çağırır)
export async function onPacketCreated(envelope, ctx) {
  const data = envelope.data;             // { packetId, total, orders[], customer?(PII) … }
  // (opsiyonel) dolu paketi Callback API'den çek: await ctx.client?.packets.get(data.packetId)
}

// API çağrısı örneği
import { api } from './src/api/index.mjs';
const client = new RestomenumClient({ apiKey, baseUrl });
const packet = await api.packets.getPacket(client, packetId);
```

## Test — tüm event'ler + API'ler
İki araç sample'a dahil:

**`npm run test:events`** — kurulum/mağaza **GEREKMEZ**. 34 event'in gerçek payload'ını (`test/fixtures/events.mjs`)
yerelde imzalayıp **tam `/webhook` akışından** geçirir (imza doğrula → dispatcher → her handler). Her handler'ın
gerçek veriyle ne yaptığını log'da görürsün — `34/34 geçti`. Her event'in zarfını `test/responses/event.<type>.json`'a
da yakalar (var olanı ezmez).

**`npm run test:api`** — kurulumun **apiKey**'iyle Callback API uçlarını çağırır, **gerçek yanıtları GÖSTERİR +
`test/responses/<uç>.json`'a KAYDEDER** (yanıt geldikçe SDK'da modellemek için). Read uçları güvenli (veri
değiştirmez); yazma round-trip yalnız `--write` ile.
```bash
API_KEY=serverId.pluginId.secret npm run test:api        # tüm read uçları (yanıtları yakalar)
API_KEY=… npm run test:api -- --write                    # + products create→update→delete (VERİ DEĞİŞTİRİR)
```
> `test/responses/` **gitignore**'da (gerçek mağaza verisi / PII içerebilir — commit/publish edilmez). Yakaladığın
> gerçek yanıtlarla SDK modellerini (`@restomenum/plugin-sdk`) gerçek şekle hizalarsın.

## Manifest (portalda)
Bu sunucunun uçlarını eklentinin sürüm manifestine gir:
- `connectUrl` → `https://<PUBLIC_URL>/connect`  ← Restomenum kurulumda buraya `?code=&state=` yönlendirir
- `webhookUrl` → `https://<PUBLIC_URL>/webhook`
- (buton kullanıyorsan) `actionUrl` → `https://<PUBLIC_URL>/action`
- (Custom UI kullanıyorsan) `page` → `customUiOrigin: https://<PUBLIC_URL>` + path `/ui` + `ui:page` scope (panelde iframe açılır)
- `events: ["table.created", ...]` + `events:subscribe` scope

Üçü de **aynı domain** altında olmalı (single-apex politikası).

## Uçlar
| Uç | İş |
|----|----|
| `GET /connect` | **Connect redirect hedefi** — `state` CSRF doğrulanır, `code` SDK `exchangeCode` ile `apiKey`+`webhookSecret`'a çevrilir, tenant başına saklanır |
| `POST /webhook` | Event + lifecycle alıcısı — SDK `verifyAndParseWebhook` ile **HMAC imza doğrular** (±5 dk, timing-safe), `id` ile **dedup** eder, hızlı `2xx` döner |
| `POST /action` | Senkron buton/hook — imzalı; SDK `actionResponse` ile `{success, message, level, display}` döner (≤8 sn) |
| `GET /ui` | **Custom UI iframe sayfası** — App Bridge'den `getSessionToken` alır, `/api/me`'ye Bearer ile taşır (panelde açılır) |
| `GET /api/me` | iframe session token doğrulama — SDK `verifySessionToken` (aud=pluginId, HMAC, exp/iat) → `{ tenantId, userId, role }` |

## Öne çıkan güvenlik desenleri
- **İmza doğrulama** ham gövde üzerinde (`t=<unixSec>,v1=HMAC_SHA256(webhookSecret,"<t>.<rawBody>")`, ±5 dk, timing-safe) — SDK `verifyAndParseWebhook`/`verifyWebhookSignature`.
- Geçersiz/şekilsiz imzaya **401** (parse detayını imzasız çağırana sızdırma).
- **Idempotency**: aynı `envelope.id` tekrar gelebilir → işle-bir-kez (`SeenEventStore`).
- **Ham gövde tavanı** (1 MB, `readRawBody`) — imzasız çağrı bellek tüketmesin (413).
- Etkileşim yalnız **id** taşır → dolu veriyi SDK Callback API istemcisiyle çek (`client.packets.get(id)`).
- `client_secret` yalnız `exchangeCode` (sunucu) çağrısında; tarayıcıya/iframe'e gitmez.

## İlgili dokümanlar
- Mimari & akış: https://dev.restomenum.com/docs/concepts
- İmza şeması: https://dev.restomenum.com/docs/webhook-signature
- Token exchange: https://dev.restomenum.com/docs/token
- Event kataloğu: https://dev.restomenum.com/docs/events
- SDK: https://www.npmjs.com/package/@restomenum/plugin-sdk
