// POST /plugin-api/products/create — Yeni ürün oluştur. Scope: products:write.
// SDK: client.products.create(body) -> Product (okuma ucuyla aynı kanonik obje döner)
// Gövde (gerçek — docs/api/products-write): { title*(2..200), price*(>=0), category*(VAR OLAN kategori id'si),
//   tax?(0..100), active?(default true), barcode?(<=64), barcodeType?(<=32), languages?(<=30 dil),
//   options?[]{ title, min, max, multiple, choices[]{ title, price } }, idempotencyKey?(önerilir) }
// Yazılamaz (gönderilirse reddedilir): cost, recete, stock, image, rank. category geçersizse plugin.catalog.categoryNotFound.
export async function createProduct(client, body) {
  // idempotencyKey önerilir: retry'da aynı ürünü iki kez yaratma. category VAR OLAN bir id olmalı.
  const created = await client.products.create(body);
  // Yanıt products/get ile aynı şekil; grup/seçim id'lerini sunucu üretir.
  return created;
}
