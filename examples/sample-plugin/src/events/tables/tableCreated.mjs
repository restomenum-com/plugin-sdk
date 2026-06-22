// table.created — Masa açıldı (canlı). Gerçek dine-in masa açılışı; müşterisiz masa açılışında tetiklenir
// (müşteri atanmış açılış packet.created'tır). Masa taşıma/dönüşümde TETİKLENMEZ.
// envelope.data (gerçek): { tableId, tableName, docNo, desing(bölüm/salon), location, personCount,
//   customer(çoğu masada null; varsa PII), orders[], total, paid, totalDiscount }.
// orders[] = paket/masa ile AYNI kanonik satır şekli: { id, title, quantity, options[], extra, discount, note, lineTotal }.
// Önerilen scope: orders:read. (customer PII → customers:read + consent yoksa maskelenir.)
export async function onTableCreated(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`table.created: ${data.tableId} (${data.tableName}) bölüm=${data.desing} kişi=${data.personCount} tutar=${data.total}`);
  // Dine-in masada müşteri genelde yok (null); varsa PII consent kuralına tabidir → güvenle yaz.
  if (data.customer) ctx.log?.(`  müşteri: ${data.customer.name ?? '—'} ${data.customer.phone ?? ''}`);
  ctx.log?.(`  satır=${data.orders?.length ?? 0} ödenen=${data.paid} indirim=${data.totalDiscount}`);
  // (opsiyonel) en güncel/dolu masayı Callback API'den çek: const fresh = await ctx.client?.tables.get(data.tableId);
  // Açık masa panosuna/dış sisteme ilet… (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
