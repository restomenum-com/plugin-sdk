// ingredient.created — Malzeme oluşturuldu (canlı). Envanter/stok kartı yeni açıldı.
// envelope.data (gerçek): { id, title, unit, stock, alert, tax }
//   unit = birim (kg/lt/adet…), stock = TOPLAM stok, alert = düşük-stok eşiği, tax = KDV oranı.
// Sızıntı önlemi: ort (maliyet=ticari sır), stocks (depo kırılımı), storages (iç depo) DÖNMEZ.
// Önerilen scope: ingredients:read.
export async function onIngredientCreated(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`ingredient.created: ${data.id} ${data.title} stok=${data.stock}${data.unit} eşik=${data.alert}`);
  // Yeni malzeme stok 0 ile oluşur (envanter hareketiyle artar); düşük-stok takibi alert ile.
  // (opsiyonel) güncel kataloğu Callback API'den çek: const all = await ctx.client?.ingredients.list();
  // Envanter/stok senkronuna yaz… (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
