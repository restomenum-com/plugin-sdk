// npm run test:api — kurulumun apiKey'iyle Callback API uçlarını çağırır, GERÇEK yanıtları GÖSTERİR + KAYDEDER.
// Amaç: dönen response'ları görüp SDK'da modellemek (§18 — yeni şekil geldikçe modele ekle).
// READ uçları güvenli (veri değiştirmez). WRITE round-trip yalnız `--write` ile (test mağazasında veri DEĞİŞTİRİR).
//
// Kullanım:
//   API_KEY=serverId.pluginId.secret npm run test:api            # tüm read uçları
//   API_KEY=… npm run test:api -- --write                        # + products create→update→delete
//   API_KEY=… npm run test:api -- --quiet                        # konsola tam JSON basma (yalnız dosyaya)
// Env: API_KEY (zorunlu), RESTOMENUM_BASE (ops; default sandbox). Yanıtlar test/responses/<uç>.json (gitignore).
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RestomenumClient, ApiError } from '@restomenum/plugin-sdk';

const apiKey = process.env.API_KEY;
const baseUrl = process.env.RESTOMENUM_BASE || 'https://sandbox.plugins.restomenum.app';
const doWrite = process.argv.includes('--write');
const quiet = process.argv.includes('--quiet');

if (!apiKey) {
  console.error('✗ API_KEY gerekli. Kurulumun apiKey\'i (token exchange): API_KEY=serverId.pluginId.secret npm run test:api');
  process.exit(2);
}

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'responses');
mkdirSync(OUT, { recursive: true });
const client = new RestomenumClient({ apiKey, baseUrl });

let ok = 0, info = 0, fail = 0;

/** Bir ucu çağır → gerçek yanıtı göster + test/responses/<name>.json'a yaz (modelleme için). */
async function call(name, fn) {
  try {
    const res = await fn();
    ok++;
    writeFileSync(join(OUT, `${name}.json`), JSON.stringify(res, null, 2));
    console.log(`\n✓ ${name}  → test/responses/${name}.json`);
    if (!quiet) console.log(preview(res));
    return res;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 403 || e.status === 404)) {
      info++; console.log(`\n• ${name} → ${e.status} ${e.code ?? ''} (scope/consent/yok — beklenebilir)`);
    } else { fail++; console.log(`\n✗ ${name} → HATA: ${e.message}`); }
    return null;
  }
}

/** Konsol önizleme — diziler/sayfalarda ilk öğe + adet (tam hâli dosyada). */
function preview(res) {
  if (Array.isArray(res)) return `  [dizi · ${res.length} öğe] ilk öğe:\n${indent(JSON.stringify(res[0] ?? null, null, 2))}`;
  if (res && Array.isArray(res.data)) {
    const meta = Object.keys(res).filter((k) => k !== 'data').map((k) => `${k}=${JSON.stringify(res[k])}`).join(' ');
    return `  { data:[${res.data.length}] ${meta} } ilk data:\n${indent(JSON.stringify(res.data[0] ?? null, null, 2))}`;
  }
  return indent(JSON.stringify(res, null, 2));
}
const indent = (s) => (s || '').split('\n').map((l) => '  ' + l).join('\n');

console.log(`▶ API yanıt denetçisi — base=${baseUrl}  write=${doWrite}`);
console.log(`  yanıtlar: ${OUT}/<uç>.json (gerçek şekiller → SDK modelle)\n— READ (güvenli) —`);

const open = await call('packets.open', () => client.packets.open());
if (open?.[0]?.packetId) await call('packets.get', () => client.packets.get(open[0].packetId));
const tOpen = await call('tables.open', () => client.tables.open());
if (tOpen?.[0]?.tableId) await call('tables.get', () => client.tables.get(tOpen[0].tableId));
await call('tables.layout', () => client.tables.layout());
const prods = await call('products.list', () => client.products.list());
const firstProd = prods?.data?.[0]?.id ?? (Array.isArray(prods) ? prods[0]?.id : undefined);
if (firstProd) await call('products.get', () => client.products.get(firstProd));
const cats = await call('categories.list', () => client.categories.list());
const firstCat = Array.isArray(cats) ? cats[0]?.id : cats?.data?.[0]?.id;
if (firstCat) await call('categories.get', () => client.categories.get(firstCat));
await call('paymentMethods.list', () => client.paymentMethods.list());
await call('ingredients.list', () => client.ingredients.list());
await call('users.get', () => client.users.get());
const custPage = await call('customers.list', () => client.customers.list({ limit: 3 }));
const firstCust = custPage?.data?.[0]?.id;
if (firstCust) await call('customers.get', () => client.customers.get(firstCust));
// IAP satın almalar — list/get READ (veri değiştirmez); create --write altında (checkout açar).
const purchases = await call('purchases.list', () => client.purchases.list({ limit: 5 }));
const firstPurchase = Array.isArray(purchases) ? purchases[0]?.purchaseId : undefined;
if (firstPurchase) await call('purchases.get', () => client.purchases.get(firstPurchase));

if (doWrite) {
  console.log('\n— WRITE round-trip (create→update→delete) — VERİ DEĞİŞTİRİR (kendi oluşturduğunu siler) —');
  // Temiz CRUD round-trip: create → update → delete; her yanıtı yakalar. Sahiplik: kendi oluşturduğun düzenlenir/silinir.
  const crud = async (name, group, createBody, updatePatch) => {
    const created = await call(`${name}.create`, () => client[group].create(createBody));
    const id = created?.id;
    if (!id) { console.log(`  ${name}: create id dönmedi → update/delete atlandı`); return; }
    await call(`${name}.update`, () => client[group].update({ id, ...updatePatch }));
    await call(`${name}.delete`, () => client[group].delete({ id }));
  };

  if (firstCat) await crud('products', 'products', { title: 'SDK Test Ürün', price: 1, category: firstCat }, { title: 'SDK Test Ürün (güncel)' });
  else console.log('• products.create atlandı: VAR OLAN kategori yok.');
  await crud('categories', 'categories', { title: 'SDK Test Kategori', active: true }, { title: 'SDK Test Kategori (güncel)' });
  await crud('paymentMethods', 'paymentMethods', { title: 'SDK Test Ödeme', description: 'test', cash: false, noreport: false }, { title: 'SDK Test Ödeme (güncel)' });
  await crud('ingredients', 'ingredients', { title: 'SDK Test Malzeme', unit: 'kg', alert: 5, tax: 1 }, { title: 'SDK Test Malzeme (güncel)' });

  console.log('not: packets/tables yazma uçları sipariş bağlamı/full-replace (canlı veriyi bozar) → bu runner ATLAR; src/api/* örneklerine bak.');

  // IAP: purchases/create — Stripe Checkout başlatır (pending satın alma kaydı; ödeme YAPILMAZ). Yanıtı yakala.
  const created = await call('purchases.create', () => client.purchases.create({ amount: 10000, productKey: 'sdk_smoke_test', description: 'test:api --write IAP smoke' }));
  if (created?.purchaseId) await call('purchases.get.created', () => client.purchases.get(created.purchaseId));
}

console.log(`\n${ok} ok · ${info} bilgi(403/404) · ${fail} hata. Tüm yanıtlar: ${OUT}/`);
process.exit(fail ? 1 : 0);
