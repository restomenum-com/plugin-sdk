// POST /plugin-api/packets/create — Yeni paket/delivery siparişi oluştur. Scope: orders:write.
// SDK: client.packets.create(body) -> { packetId }
// Gövde (gerçek, bkz. docs/api/packets-create):
//   { customer:{ id, name, address, region?, addressDescription?, phone?, call? },  // id/name/address ZORUNLU
//     cart:[ { product(ürün id), quantity, options?(adlar), discount?, note? } ],   // 1..200 kalem
//     paymentNote(zorunlu), payments?:[{ id, title, price, isDiscount? }], note?, status?('none'|'Approved'),
//     restaurantDelivery?, idempotencyKey?(ÖNERİLİR), callbackUrl?(https, webhookUrl ile aynı domain) }
export async function createPacket(client, body) {
  // Fiyatlar OTORİTERdir: satır fiyatı Restomenum ürün kaydından alınır; gövdede fiyat gönderilmez/yok sayılır.
  // idempotencyKey gönder → retry'da çift sipariş yazılmaz (24sa pencere). Ödeme satırı id'leri payment-methods/list'ten gelmeli.
  const created = await client.packets.create(body);
  // Yanıt yalnız { packetId } döner → tam detayı client.packets.get(created.packetId) ile çek.
  return created;
}
