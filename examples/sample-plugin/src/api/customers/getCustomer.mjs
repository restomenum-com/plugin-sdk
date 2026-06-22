// GET /plugin-api/customers/get — Tek müşteri detayı (ID ile). Scope: customers:read (PII).
// SDK: client.customers.get(customerId) -> Customer
// Yanıt (gerçek, SDK Customer modeli): { id, region, name?(PII), phone?(PII), address?(PII), total }.
//   PII (name/phone/address) yalnız customers:read + tenant consent ile dolu; aksi halde yalnız { id, region }
//   (total finansaldır ama consent'siz allowlist {id,region}'a indiğinden o da düşer) — undefined varsay.
export async function getCustomer(client, customerId) {
  const customer = await client.customers.get(customerId);
  // Kanonik kimlik alanı 'id' (asla null). PII alanları consent kuralına tabidir → name ?? '—'.
  return customer;
}
