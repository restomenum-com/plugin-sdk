// POST /plugin-api/ingredients/update — Malzeme kartını güncelle. Scope: ingredients:write.
// SDK: client.ingredients.update(body) -> { id, title, unit, stock, alert, tax }
// Gövde (gerçek, bkz. docs/api/ingredients-write): { id } + title/unit/alert/tax'tan EN AZ BİRİ.
//   Sahiplik kontrollü (notOwned): yalnız kendi oluşturduğun malzemeyi düzenleyebilirsin.
//   stock/ort (maliyet) yazılamaz (yalnız meta alanları). Yanıt list ile aynı şekil.
export async function updateIngredient(client, { id, title, unit, alert, tax } = {}) {
  // Yalnız değişen alanları gönder; en az bir alan zorunlu (sadece { id } reddedilir).
  const updated = await client.ingredients.update({ id, title, unit, alert, tax });
  return updated;
}
