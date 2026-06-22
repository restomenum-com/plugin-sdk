// GET /plugin-api/packets/get — Paket detayı (dolu order). Scope: orders:read.
// SDK: client.packets.get(packetId) -> Packet
// Yanıt (gerçek, SDK Packet modeli): { packetId, docNo, entegrasyon(string kanal kodu), total, paid, totalDiscount, paymentNote?, orders[], customer?(PII), orderCode?/isScheduled?/scheduledDate?/note?(durumsal) }
export async function getPacket(client, packetId) {
  const packet = await client.packets.get(packetId);
  // Kanonik kimlik alanı 'packetId' (id DEĞİL). entegrasyon STRING kod ('packet'|'yemeksepeti'…), obje değil.
  // Müşteri PII'si customers:read + consent kuralına tabidir; orderCode/isScheduled vb. opsiyonel → eksikliğe dayanıklı oku.
  return packet;
}
