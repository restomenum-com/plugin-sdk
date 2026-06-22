// GET /plugin-api/tables/open — O an AÇIK dine-in (masa) hesaplarının ÖZET listesi. Scope: orders:read.
// SDK: client.tables.open() -> TableSummary[] (özet; satırlar/müşteri DÖNMEZ — detay için tables/get).
// Yanıt (gerçek özet alanları): her masada { tableId, tableName, docNo, desing, personCount, itemCount, total, paid, totalDiscount }.
// Açık bakiye = total - paid (uçta ayrı alan yok, istemci hesaplar).
export async function listOpenTables(client) {
  const tables = await client.tables.open();
  // Önbellek yok → her çağrı canlı. Polling 10-30 sn; install başına 120 istek/dk sınırını aşma (429 plugin.rateLimited).
  return tables;
}
