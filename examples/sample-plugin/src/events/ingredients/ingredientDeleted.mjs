// ingredient.deleted — Malzeme silindi (canlı). Silinen malzemenin SON hâli gelir (created/updated ile aynı şekil).
// envelope.data (gerçek): { id, title, unit, stock, alert, tax } — silinmeden önceki son snapshot.
// Sızıntı önlemi: ort (maliyet), stocks, storages DÖNMEZ — yalnız toplam stock.
// Önerilen scope: ingredients:read.
export async function onIngredientDeleted(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`ingredient.deleted: ${data.id} ${data.title}`);
  // Yerel envanter kaydını sil/arşivle (tombstone). list() artık bu id'yi döndürmez.
  // Idempotent ol: aynı id ikinci kez gelirse (retry) tekrar silme — envelope.id ile webhookRoute dedup yapar.
}
