// GET /plugin-api/tables/get?id={tableId} — Tek masanın DOLU detayı (satırlar, tutar, müşteri). Scope: orders:read.
// SDK: client.tables.get(tableId) -> Table (kimlik AYRI: tableId/tableName/desing — packetId DEĞİL; yalnız orders[]+totaller packets ile ortak).
// Yanıt (gerçek, SDK Table modeli): { tableId, tableName, desing, location, personCount, total, paid, totalDiscount,
//   orders[]{ id, title, quantity, options[], extra, discount, note, lineTotal }, customer?(dine-in'de genelde yok) }.
// NOT: tableId URL-encoded olabilir (Türkçe karakter); SDK encodeURIComponent uygular → ham id'yi ver, tekrar encode etme.
export async function getTable(client, tableId) {
  const table = await client.tables.get(tableId);
  // Kanonik kimlik alanı 'tableId' (id DEĞİL). customer alanı PII consent kuralına tabidir (customers:read).
  return table;
}
