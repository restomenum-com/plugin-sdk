// table.closed — Masa kapatıldı (canlı). Adisyon ödenip masa kapanınca düşer; final hesap snapshot'ı gelir.
// envelope.id = tableclosed_<serverId><saleId> (deterministik → retry'da dedup için kullan).
// envelope.data (gerçek): { tableId, tableName, docNo, desing(bölüm), location, personCount,
//   orders[], total, paid, totalDiscount, status(çoğu kapanışta null), channel("TABLE") }.
// orders[] = kanonik satır şekli { id, title, quantity, options[], extra?, discount?, note?, lineTotal }.
// Önerilen scope: orders:read.
export async function onTableClosed(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`table.closed: ${data.tableId} (${data.tableName}) kanal=${data.channel} tutar=${data.total} ödenen=${data.paid}`);
  ctx.log?.(`  satır=${data.orders?.length ?? 0} indirim=${data.totalDiscount} durum=${data.status ?? '—'}`);
  // Kapanan masa Restomenum'da silinir → tables/get artık 404 döner; final veriyi BU envelope'tan al (tekrar çekme).
  // Muhasebe/Z-raporu/satış senkronuna yaz… (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
