// src/api/categories/deleteCategory.mjs
// POST /plugin-api/categories/delete — Kategoriyi siler. Scope: products:write.
// SDK: client.categories.delete(body) -> sonuç zarfı
// Gövde (gerçek, docs categories/delete): { id }
// ÖNEMLİ: Kategori BOŞ olmalı — bağlı ürün varsa plugin.catalog.categoryNotEmpty (güvenli ret; kaskad silme kapalı).
// Önce ürünleri sil/başka kategoriye taşı. Sahiplik kontrollü (notOwned).
export async function deleteCategory(client, id) {
  const result = await client.categories.delete({ id });
  // Idempotent çağır: aynı id ikinci kez silinmeye çalışılırsa "yok" durumunu sessizce ele al.
  return result;
}
