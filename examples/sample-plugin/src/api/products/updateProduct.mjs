// POST /plugin-api/products/update — Var olan ürünü güncelle. Scope: products:write.
// SDK: client.products.update(body) -> Product (okuma ucuyla aynı kanonik obje döner)
// Gövde (gerçek — docs/api/products-write): { id*(ürün id'si) + en az 1 yazılabilir alan (create ile aynı küme:
//   title, price, category, tax, active, barcode, barcodeType, languages, options) }
// options gönderilirse TAM DEĞİŞTİRME (replace) — mevcut gruplar silinir. Sahiplik: siz oluşturmadıysanız plugin.catalog.notOwned.
export async function updateProduct(client, body) {
  // body { id, ... } — id zorunlu + en az bir yazılabilir alan. cost/recete/stock/image/rank yazılamaz.
  const updated = await client.products.update(body);
  return updated;
}
