// POST /plugin-api/packets/update-orders — Paketin TÜM kalemlerini değiştir (FULL REPLACE). Scope: orders:write.
// SDK: client.packets.updateOrders(body) -> { packetId, total }
// Gövde (gerçek, bkz. docs/api/packets-update-orders):
//   { packetId(ZORUNLU), cart:[ { product(ürün id), quantity(≥0.001), options?(adlar), discount?, note? } ] (en az 1) }
export async function updatePacketOrders(client, body) {
  // cart MERGE değil tam değiştirir; total Restomenum ürün fiyatlarından yeniden hesaplanır (gönderilen fiyat yok sayılır).
  // Mevcut paid yeni total'ı aşarsa reddedilir → update-payments ile sıralı çağır (eş zamanlı değil).
  const result = await client.packets.updateOrders(body);
  return result;
}
