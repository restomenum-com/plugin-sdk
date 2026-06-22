// POST /plugin-api/products/delete — Ürünü sil. Scope: products:write.
// SDK: client.products.delete(body) -> { id, deleted: true }
// Gövde (gerçek — docs/api/products-write): { id }(ürün id'si).
// Ürünün görselleri de temizlenir. Sahiplik kontrollü: siz oluşturmadıysanız plugin.catalog.notOwned.
export async function deleteProduct(client, id) {
  const result = await client.products.delete({ id });
  // Yanıt: { id, deleted: true }.
  return result;
}
