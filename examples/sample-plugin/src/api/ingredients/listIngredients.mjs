// GET /plugin-api/ingredients/list — Malzeme/stok kataloğu (envanter snapshot). Scope: ingredients:read.
// SDK: client.ingredients.list() -> Array<{ id, title, unit, stock, alert, tax }>
// Yanıt (gerçek): zarf { success, data:[…], truncated }; data dizi olarak gelir (parametre yok, tümü döner).
//   truncated:true → 2000 üstü malzeme (restoran ölçeğinde pratikte ulaşılmaz). Değişimler için ingredient.* event'leri.
// Sızıntı önlemi: ort (maliyet), stocks (depo kırılımı), storages DÖNMEZ — yalnız toplam stock.
export async function listIngredients(client) {
  const ingredients = await client.ingredients.list();
  // Düşük-stok malzemeleri ayıkla (stok eşiğin altına düşmüş): basit envanter uyarısı.
  const lowStock = ingredients.filter((ing) => ing.stock <= ing.alert);
  return { ingredients, lowStock };
}
