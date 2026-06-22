// npm run test:events — 23 event'in GERÇEK payload'ını yerelde imzalayıp tam /webhook akışından geçirir.
// Mağazaya/canlıya GEREK YOK: signature verify + parse + dispatcher + her handler in-process çalışır.
// (Handler'lar yalnız loglar + opsiyonel ctx.client kurar; gerçek ağ çağrısı yapılmaz.)
import { Readable } from 'node:stream';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { signPayload } from '@restomenum/plugin-sdk';
import { makeWebhookRoute } from '../src/routes/webhookRoute.mjs';
import { SeenEventStore } from '../src/store/SeenEventStore.mjs';
import { HANDLED_EVENTS } from '../src/events/index.mjs';
import { EVENT_FIXTURES } from './fixtures/events.mjs';

const SECRET = 'whsec_test_local';
const TENANT = 'tnt_test';
// Test kurulumu: webhook imzası bu secret'la doğrulanır; apiKey ctx.client için (gerçek çağrı yok).
const installStore = { find: (t) => (t === TENANT ? { tenantId: TENANT, webhookSecret: SECRET, apiKey: 'srv.plg.secret', scopes: [] } : null) };
const webhook = makeWebhookRoute({ installStore, seenEventStore: new SeenEventStore(), restomenumBase: 'https://sandbox.plugins.restomenum.app' });

const mkReq = (body, sig) => Object.assign(Readable.from([Buffer.from(body, 'utf8')]), { headers: { 'x-restomenum-signature': sig } });
const mkRes = () => ({ status: 0, body: null, writeHead(s) { this.status = s; }, end(b) { this.body = b; } });

// Her event'in GERÇEK payload'ını (webhook'a gelen zarf) test/responses/event.<type>.json'a yakala.
// VAR OLANI EZME — yalnız eksikse yaz (yanıtlar gitignore; PII/mağaza verisi public'e gitmez).
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'responses');
mkdirSync(OUT, { recursive: true });

console.log(`▶ ${EVENT_FIXTURES.length} event replay → /webhook (imza doğrula → dispatcher → handler)\n`);
let pass = 0, fail = 0, wrote = 0;
for (const envelope of EVENT_FIXTURES) {
  const body = JSON.stringify(envelope);
  const res = mkRes();
  try {
    await webhook(mkReq(body, signPayload(body, SECRET)), res);
    res.status === 200 ? pass++ : fail++;
    // 200 ise zarfı yakala (eksikse) — bu, eklentinin webhook'ta aldığı gerçek payload'tır.
    if (res.status === 200) {
      const file = join(OUT, `event.${envelope.type}.json`);
      if (!existsSync(file)) { writeFileSync(file, JSON.stringify(envelope, null, 2)); wrote++; }
    }
    console.log(`${res.status === 200 ? '✓' : '✗'} ${envelope.type.padEnd(26)} → ${res.status}`);
  } catch (e) {
    fail++;
    console.log(`✗ ${envelope.type.padEnd(26)} → HATA: ${e.message}`);
  }
}
console.log(`\n📝 event payload yakalama: ${wrote} yeni dosya → test/responses/event.*.json (var olanlar atlandı)`);

// Kapsama: her handler'ın bir fixture'ı var mı?
const covered = new Set(EVENT_FIXTURES.map((e) => e.type));
const missing = HANDLED_EVENTS.filter((t) => !covered.has(t));
console.log(`\n${pass}/${EVENT_FIXTURES.length} geçti${fail ? `, ${fail} kaldı` : ''}.`);
if (missing.length) console.log(`⚠ fixture eksik (handler var, payload yok): ${missing.join(', ')}`);
process.exit(fail || missing.length ? 1 : 0);
