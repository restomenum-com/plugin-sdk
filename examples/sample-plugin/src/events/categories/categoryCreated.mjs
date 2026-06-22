// src/events/categories/categoryCreated.mjs
// category.created — Kategori oluşturuldu (canlı). Menü ağacına yeni ürün kategorisi eklendi.
// envelope.data (gerçek): { id, title, image(CDN URL|null), rank, active, languages }
// NOT: event payload'ı `color` DÖNDÜRMEZ (yalnız API categories/list/get'te var); `languages` gelir.
// Önerilen scope: products:read.
export async function onCategoryCreated(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`category.created: ${data.id} "${data.title}" rank=${data.rank} aktif=${data.active}`);
  // Kategori id'si ürünün `category` alanıyla eşleşir → yerel menü ağacını/gruplamayı güncelle.
  // (opsiyonel) `color` gibi event'te olmayan alanlar gerekiyorsa API'den zenginleştir:
  //   const full = await ctx.client?.categories.get(data.id);
  // Idempotency webhookRoute'ta envelope.id ile sağlanır (retry'da aynı id tekrar gelebilir → dedup).
}
