// POST /plugin-api/packets/update — Paketin sınırlı alanlarını güncelle (allowlist). Scope: orders:write.
// SDK: client.packets.update(body) -> { packetId, updated[] }
// Gövde (gerçek, bkz. docs/api/packets-update):
//   { packetId(ZORUNLU), status?(none|Approved|Ready|OnDelivery|Delivered|Rejected — yalnız LABEL),
//     note?(""→temizler), paymentNote?, invoiceUrl?(https), invoiceNumber?, customer?:{ address?, phone? }(KISMİ) }
//   ⚠️ total/paid/orders/payments bu uçla DEĞİŞMEZ (update-orders / update-payments kullan). Tanımsız alan → success:false.
export async function updatePacket(client, body) {
  const result = await client.packets.update(body);
  // status yalnız etiket yazar (yaşam döngüsü tetiklemez); Delivered finansal kapanış DEĞİL. updated[] = gerçekten değişen alanlar.
  return result;
}
