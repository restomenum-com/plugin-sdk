// npm run test:orders — packets/tables ORDER-CONTEXT yazma uçları (geri kalan 6; full-replace).
// ⚠️ CANLI SİPARİŞ OLUŞTURUR/DEĞİŞTİRİR — yalnızca TEST mağazasında:
//   • packets: yeni bir TEST paketi yaratır (API'de silinemez → panelden iptal et) ve üzerinde update/update-orders/update-payments dener.
//   • tables: mevcut siparişi bozmamak için BOŞ bir masaya sipariş yazar (panelden temizle).
// Gerçek yanıtları test/responses/'a yakalar (SDK modelle, §18.3). Kullanım: API_KEY=… npm run test:orders
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RestomenumClient, ApiError } from '@restomenum/plugin-sdk';

const apiKey = process.env.API_KEY;
const baseUrl = process.env.RESTOMENUM_BASE || 'https://sandbox.plugins.restomenum.app';
if (!apiKey) { console.error('✗ API_KEY gerekli: API_KEY=serverId.pluginId.secret npm run test:orders'); process.exit(2); }

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'responses');
mkdirSync(OUT, { recursive: true });
const client = new RestomenumClient({ apiKey, baseUrl });

let ok = 0, fail = 0;
const call = async (name, fn) => {
  try {
    const r = await fn();
    ok++;
    writeFileSync(join(OUT, `${name}.json`), JSON.stringify(r, null, 2));
    console.log(`✓ ${name}  → test/responses/${name}.json\n  ${JSON.stringify(r)}`);
    return r;
  } catch (e) {
    fail++;
    console.log(`✗ ${name} → ${e instanceof ApiError ? `${e.status} ${e.code ?? ''}` : e.message}`);
    return null;
  }
};

// — Önkoşullar: bir ürün id + gerçek ödeme yöntemi + BOŞ masa (id'de %-encode YOK; raw=encoded) —
const prods = await client.products.list();
const productId = prods?.data?.[0]?.id;
const pms = await client.paymentMethods.list();
const pm = Array.isArray(pms) ? pms[0] : pms?.data?.[0]; // { id, title }
const open = await client.tables.open().catch(() => []);
// tables.update-orders AÇIK masa doc'u ister (boş/kapalı masa → 404). Mevcut siparişi olan bir açık masayı
// kullan (paid:0 tercih → ödeme constraint'i yok). ⚠️ bu masanın MEVCUT sipariş kalemleri test sepetiyle DEĞİŞTİRİLİR.
const openTable = (open ?? []).find((t) => (t.paid ?? 0) === 0)?.tableId ?? (open ?? [])[0]?.tableId;

console.log(`▶ order-context writes — ürün=${productId} ödeme=${pm?.id} açıkMasa=${openTable}\n`);
if (!productId) { console.error('✗ ürün yok → test edilemez'); process.exit(1); }
const pay = pm ? [{ price: 1, id: pm.id, title: pm.title }] : [];

// — PACKETS: yeni TEST paketi → update → update-orders → update-payments —
const created = await call('packets.create', () => client.packets.create({
  customer: { id: 'sdk-test', name: 'SDK Test', address: 'Test Adres' },
  cart: [{ product: productId, quantity: 1 }],
  paymentNote: 'sdk-test',
  idempotencyKey: 'sdk-test-packet-1',
}));
const packetId = created?.packetId;
if (packetId) {
  await call('packets.update', () => client.packets.update({ packetId, note: 'sdk-test-not' }));
  await call('packets.update-orders', () => client.packets.updateOrders({ packetId, cart: [{ product: productId, quantity: 2 }] }));
  await call('packets.update-payments', () => client.packets.updatePayments({ packetId, payments: pay }));
  console.log(`  ⓘ test paketi ${packetId} AÇIK kaldı (API'de silinemez) → panelden iptal et.`);
} else {
  console.log('• packets.update/orders/payments atlandı: create packetId dönmedi.');
}

// — TABLES: AÇIK masaya full-replace (⚠️ mevcut sipariş kalemleri DEĞİŞİR) → ödeme —
if (openTable) {
  await call('tables.update-orders', () => client.tables.updateOrders({ tableId: openTable, cart: [{ product: productId, quantity: 1 }] }));
  await call('tables.update-payments', () => client.tables.updatePayments({ tableId: openTable, payments: pay }));
  console.log(`  ⓘ ${openTable} masasının MEVCUT siparişi test sepetiyle DEĞİŞTİRİLDİ → panelden düzelt.`);
} else {
  console.log('• tables write atlandı: açık masa yok.');
}

console.log(`\n${ok} ok · ${fail} hata. Yanıtlar: ${OUT}/`);
process.exit(fail ? 1 : 0);
