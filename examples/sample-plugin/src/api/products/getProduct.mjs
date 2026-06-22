// GET /plugin-api/products/get — Bir ürünün tam detayı (id ile). Scope: products:read.
// SDK: client.products.get(id) -> Product
// Yanıt (gerçek): { id, title, category(kategori ID'si — ad değil), price, tax, active,
//   image(CDN URL|null), barcode, barcodeType, stock, languages?, options[]{ id?, title, min, max, multiple, choices[]{ id, title, price } } }
// Tip incelikleri: options[].min/max string VEYA number; choices[].id number; stock negatif olabilir.
// cost/recete ASLA dönmez (ticari sır). Yoksa: plugin.products.notFound.
export async function getProduct(client, id) {
  const product = await client.products.get(id);
  // Kanonik kimlik alanı 'id'. category bir kategori ID'sidir (görünen ad değil) → ad için categories/get.
  // options[] her biri seçenek grubu (min/max/multiple = seçim kuralı); choices[].price = ek ücret.
  return product;
}
