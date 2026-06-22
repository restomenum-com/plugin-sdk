// POST /plugin-api/packets/update-payments — Paketin TÜM ödemelerini değiştir (FULL REPLACE). Scope: orders:write.
// SDK: client.packets.updatePayments(body) -> { packetId, paid }
// Gövde (gerçek, bkz. docs/api/packets-update-payments):
//   { packetId(ZORUNLU), payments:[ { price, id, title, isDiscount? } ] }  // [] → paid:0 (ödemeleri sıfırlar)
export async function updatePacketPayments(client, body) {
  // Normal satırın id'si tenant'ın GERÇEK yöntemi olmalı (önce payment-methods/list); aksi halde unknown_payment_method.
  // isDiscount:true → doğrulamadan muaf (serbest id) ama title zorunlu. paid yeniden hesaplanır (yalnız price>0 saklanır).
  const result = await client.packets.updatePayments(body);
  return result;
}
