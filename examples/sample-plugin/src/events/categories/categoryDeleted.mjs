// src/events/categories/categoryDeleted.mjs
// category.deleted — Kategori silindi (canlı). Menü ağacından bir ürün kategorisi kaldırıldı.
// envelope.data (gerçek): { id, title, image(CDN URL|null), rank, active, languages } — silinen kaydın son snapshot'ı.
// NOT: event payload'ı `color` DÖNDÜRMEZ; `languages` gelir.
// Önerilen scope: products:read.
export async function onCategoryDeleted(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`category.deleted: ${data.id} "${data.title}"`);
  // Yereldeki kategoriyi id ile sil/işaretle. Bağlı ürünler artık bu kategoriye referans veremez;
  // ürün eşlemelerini temizle (platformda kategori silmek için kategori boş olmalıdır).
  // Idempotent ol: aynı id ikinci kez gelirse "zaten yok" durumunu sessizce geç.
}
