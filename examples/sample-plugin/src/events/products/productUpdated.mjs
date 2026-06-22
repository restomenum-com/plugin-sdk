// product.updated — Ürün güncellendi (canlı). data = ürünün GÜNCEL tam hâli (diff değil).
// envelope.data (gerçek): { id, title, category(kategori ID'si), price, tax, active, image(CDN URL|null),
//   barcode, barcodeType, stock, languages?, options[]{ id?, title, min, max, multiple, choices[]{ id, title, price } } }
// created/updated/deleted aynı şekil; yalnız type farklı. NOT: cost/recete ASLA gelmez (ticari sır).
// Önerilen scope: products:read.
export async function onProductUpdated(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`product.updated: ${data.id} "${data.title}" yeni fiyat=${data.price} stok=${data.stock ?? 0}`);
  // Snapshot tam gelir; eski değerle karşılaştırmak istiyorsan kendi aynandaki önceki kaydı kullan.
  // active=false → ürün satıştan kalkmış olabilir; kendi menünde de pasifle.
  if (data.active === false) ctx.log?.(`  ürün pasif: ${data.id}`);
  // (opsiyonel) en güncel/dolu hâli Callback API'den teyit et: const fresh = await ctx.client?.products.get(data.id);
  // Kendi menü aynanı upsert et (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
