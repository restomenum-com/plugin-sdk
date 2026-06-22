// src/api/categories/getCategory.mjs
// GET /plugin-api/categories/get?id={categoryId} — Tek kategori detayı. Scope: products:read.
// SDK: client.categories.get(id) -> Category
// Yanıt (gerçek): data = { id, title, image(CDN URL|null), color(hex), rank, active } — list öğesiyle birebir aynı şekil.
// Tipik kullanım: category.* event'indeki id'yi zenginleştirmek (event'te color yok, burada var).
export async function getCategory(client, id) {
  const category = await client.categories.get(id);
  // Kanonik kimlik alanı `id`. Yoksa uç plugin.categories.notFound döndürür (200 zarf, success:false).
  return category;
}
