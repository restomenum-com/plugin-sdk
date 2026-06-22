// ingredient.updated — Malzeme güncellendi (canlı). Tam güncel snapshot gelir (diff değil; eski değer taşımaz).
// envelope.data (gerçek): { id, title, unit, stock, alert, tax }
//   stock = güncel TOPLAM stok (envanter hareketleri burada yansır); alert = düşük-stok eşiği.
// Sızıntı önlemi: ort (maliyet), stocks (depo kırılımı), storages DÖNMEZ — yalnız toplam stock.
// Önerilen scope: ingredients:read.
export async function onIngredientUpdated(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`ingredient.updated: ${data.id} ${data.title} stok=${data.stock}${data.unit} eşik=${data.alert}`);
  // Snapshot olduğundan değişen alanı bulmak için yerel önceki kaydınla karşılaştır (örn. stok < alert → uyarı tetikle).
  // (opsiyonel) doğrulama/zenginleştirme için taze çek: const all = await ctx.client?.ingredients.list();
  // Envanter kaydını upsert et (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
