// POST /plugin-api/tables/update-orders — Masanın TÜM kalemlerini değiştirir (FULL REPLACE; masayı KAPATMAZ). Scope: orders:write.
// SDK: client.tables.updateOrders(body) -> { tableId, total } (total kuver DAHİL, Restomenum hesaplar).
// Gövde (gerçek, bkz. docs/api/tables-update-orders):
//   { tableId(zorunlu, açık masa doc id), cart[]{ product(productId), quantity, options?(adlar), discount?, note? } }
// Fiyat otoritesi Restomenum ürün kaydı (normal satış fiyatı); gönderilen fiyat yok sayılır. Timer ürünlü masada reddedilir.
export async function updateTableOrders(client, tableId, cart) {
  // cart masanın TÜM kalemlerini değiştirir (merge değil) — eksik bırakılan satır silinir.
  const body = { tableId, cart };
  const r = await client.tables.updateOrders(body);
  // Yeni total mevcut ödemenin altındaysa 400 (önce tables/update-payments ile ödemeleri düşür).
  return r;
}
