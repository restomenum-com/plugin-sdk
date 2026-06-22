// src/api/categories/listCategories.mjs
// GET /plugin-api/categories/list — Mağazanın tüm ürün kategorileri (aktif + pasif). Scope: products:read.
// SDK: client.categories.list() -> Category[]
// Yanıt (gerçek, teyitli): data = dizi; her öğe { id, title, image(CDN URL|null), color(hex), rank, active }.
// Parametre yok. İç alanlar (qrHide/webstoreHide) dönmez; en fazla 500 kategori.
export async function listCategories(client) {
  const categories = await client.categories.list();
  // Kategori id'si ürünün `category` alanıyla eşleşir → önce kategoriler, sonra products/list → menü ağacı.
  // rank ile sırala (menüdeki gösterim sırası); pasif (active=false) kategorileri filtrelemek isteyebilirsin.
  return categories;
}
