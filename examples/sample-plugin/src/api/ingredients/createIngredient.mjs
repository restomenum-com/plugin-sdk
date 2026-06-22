// POST /plugin-api/ingredients/create — Yeni malzeme/stok kartı. Scope: ingredients:write.
// SDK: client.ingredients.create(body) -> { id, title, unit, stock, alert, tax }
// Gövde (gerçek, bkz. docs/api/ingredients-write): { title*(2..100), unit*(<=32), alert?(>=0), tax?(0..100), idempotencyKey? }
//   stock/ort (maliyet)/depo kırılımı YAZILAMAZ; yeni malzeme stok 0 ile oluşur (envanter hareketiyle artar).
export async function createIngredient(client, { title, unit, alert, tax, idempotencyKey } = {}) {
  // idempotencyKey ver: retry'da aynı malzeme iki kez oluşmasın (sunucu tarafı dedup).
  const created = await client.ingredients.create({ title, unit, alert, tax, idempotencyKey });
  return created;
}
