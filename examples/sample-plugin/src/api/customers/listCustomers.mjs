// GET /plugin-api/customers/list — Tüm müşteri kataloğu (CRM/sadakat senkron). Scope: customers:read (PII).
// SDK: client.customers.listAll(pageSize) -> AsyncGenerator<Customer> (cursor/keyset — offset YOK).
//   Tek tek SDK customers.list({ limit, after }) -> { data: Customer[], nextCursor, hasMore } sayfalar; listAll bunu gezdirir.
// Yanıt (gerçek, SDK Customer modeli): her öğe { id, region, name?(PII), phone?(PII), address?(PII), total }.
//   PII consent yoksa öğe yalnız { id, region }'a iner (name/phone/address/total düşer) — undefined varsay.
export async function listCustomers(client, pageSize = 200) {
  const all = [];
  // for await: SDK cursor'ı sayfa sayfa gezer; hasMore false olunca durur (sonsuz döngü yok).
  for await (const customer of client.customers.listAll(pageSize)) {
    // Kanonik kimlik alanı 'id'. PII consent'siz öğelerde name/phone/address undefined gelebilir.
    all.push(customer);
  }
  return all;
}
