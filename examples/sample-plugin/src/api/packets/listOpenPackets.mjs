// GET /plugin-api/packets/open — O an AÇIK paket/delivery hesaplarının ÖZETİ. Scope: orders:read.
// SDK: client.packets.open() -> Packet[]
// Yanıt (gerçek, özet): her satır { packetId, docNo, orderCode?, entegrasyon, isScheduled?, scheduledDate?, itemCount, total, paid, totalDiscount }
// NOT: liste = özet; orders[]/customer DÖNMEZ → detay için packets.get(packetId).
export async function listOpenPackets(client) {
  const open = await client.packets.open();
  // Açık bakiye = total - paid (istemci hesaplar). orderCode/isScheduled yalnız entegrasyon/scheduled siparişte gelir.
  return open;
}
