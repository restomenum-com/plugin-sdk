// src/api/categories/createCategory.mjs
// POST /plugin-api/categories/create — Yeni ürün kategorisi oluşturur. Scope: products:write.
// SDK: client.categories.create(body) -> Category
// Gövde (gerçek, docs categories/create): { title(ZORUNLU 2..100), active?(default true), color?(<=32),
//   languages?({ <lang>: { title } }), idempotencyKey? }
// Yanıt: categories/list ile aynı şekil { id, title, image, color, rank, active, languages }.
// Yeni kategori KÖK ve hiçbir menüye atanmamış oluşur (menü ataması/hiyerarşi panelden; API'de yazılamaz).
export async function createCategory(client, body) {
  // Örn. body = { title: 'Tatlılar', active: true, color: '#ff8800', idempotencyKey: 'cat-1' }
  const created = await client.categories.create(body);
  // Yanıttaki `id`, ürünlerin `category` alanında kullanılır → önce kategori, sonra products/create.
  // idempotencyKey ver: retry'da çift kategori oluşmaz.
  return created;
}
