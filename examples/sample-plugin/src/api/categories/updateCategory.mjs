// src/api/categories/updateCategory.mjs
// POST /plugin-api/categories/update — Mevcut kategoriyi günceller. Scope: products:write.
// SDK: client.categories.update(body) -> Category
// Gövde (gerçek, docs categories/update): { id(ZORUNLU) } + title/active/color/languages'ten EN AZ BİRİ.
// Sahiplik kontrollü (yabancı kayıt → notOwned). Yanıt: list ile aynı şekil { id, title, image, color, rank, active, languages }.
export async function updateCategory(client, body) {
  // Örn. body = { id: 'a0-0c', title: 'Tatlılar & İçecekler' } — yalnız değişen alanları gönder.
  const updated = await client.categories.update(body);
  return updated;
}
