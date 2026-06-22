// src/events/categories/categoryUpdated.mjs
// category.updated — Kategori güncellendi (canlı). Başlık/sıra/aktiflik/dil değişti (tam snapshot, diff değil).
// envelope.data (gerçek): { id, title, image(CDN URL|null), rank, active, languages }
// NOT: event payload'ı `color` DÖNDÜRMEZ (yalnız API categories/list/get'te var); `languages` gelir.
// Önerilen scope: products:read.
export async function onCategoryUpdated(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`category.updated: ${data.id} "${data.title}" rank=${data.rank} aktif=${data.active}`);
  // Snapshot tam gelir (diff değil) → yereldeki kaydı id ile bul ve üzerine yaz (upsert).
  // active=false ise kategori menüde gizlenmiş olabilir; bağlı ürün görünürlüğünü buna göre güncelle.
  // (opsiyonel) `color`/dolu veri gerekiyorsa: const full = await ctx.client?.categories.get(data.id);
}
