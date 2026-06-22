// product.deleted — Ürün silindi (canlı). data = silinen ürünün SON hâli (silinmeden önceki snapshot).
// envelope.data (gerçek): { id, title, category(kategori ID'si), price, tax, active, image(CDN URL|null),
//   barcode, barcodeType, stock, languages?, options[]{ id?, title, min, max, multiple, choices[]{ id, title, price } } }
// created/updated/deleted aynı şekil; yalnız type farklı. NOT: cost/recete ASLA gelmez (ticari sır).
// Önerilen scope: products:read.
export async function onProductDeleted(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`product.deleted: ${data.id} "${data.title}"`);
  // Ürün artık katalogda yok → products.get(data.id) plugin.products.notFound döner; çekme, yalnız kaldır.
  // Kendi menü aynandan bu id'yi sil (idempotency: aynı id ikinci kez gelirse no-op kalmalı).
}
