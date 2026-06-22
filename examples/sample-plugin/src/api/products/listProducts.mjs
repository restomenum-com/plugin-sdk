// GET /plugin-api/products/list — Tüm ürün kataloğu (aktif + pasif). Scope: products:read.
// SDK: client.products.list() -> { data: Product[], truncated?, total? }
// Yanıt (gerçek): data[] her öğe products/get ile aynı kanonik şekil:
//   { id, title, category(kategori ID'si), price, tax, active, image(CDN URL|null), barcode, barcodeType, stock, languages?, options[] }
// Güvenlik tavanı: en fazla 2000 ürün → aşılırsa truncated:true + total:N. cost/recete ASLA dönmez.
export async function listProducts(client) {
  const result = await client.products.list();
  // result.data = ürün dizisi. active alanına göre kendin filtrele (pasifler de gelir).
  const active = result.data.filter((p) => p.active);
  // truncated yoksa liste eksiksiz; varsa total kadar ürün var ama yalnız ilk 2000 döndü.
  if (result.truncated) {
    // Büyük katalog: kalanını başka yolla (sayfalama yok) — pratikte restoran ölçeğinde ulaşılmaz.
  }
  return { all: result.data, active, truncated: result.truncated, total: result.total };
}
