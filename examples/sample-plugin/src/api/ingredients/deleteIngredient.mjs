// POST /plugin-api/ingredients/delete — Malzeme kartını sil. Scope: ingredients:write.
// SDK: client.ingredients.delete(body) -> { id, deleted }
// Gövde (gerçek, bkz. docs/api/ingredients-write): { id }.
//   Yanıt (gerçek 200): { id, deleted:true }. Sahiplik kontrollü (notOwned): yalnız kendi oluşturduğunu silebilirsin.
export async function deleteIngredient(client, { id } = {}) {
  const result = await client.ingredients.delete({ id });
  // result.deleted === true → silindi. Idempotent davran: yerelde de tombstone bırak.
  return result;
}
