// customer.created — Müşteri oluşturuldu (canlı). CRM/cari kaydı yeni açıldı; tam snapshot gelir (diff değil).
// envelope.data (gerçek): { customerId, customer } — customer = allowlist şekli
//   { id, name?(PII), phone?(PII), address?(PII), total } (yeni kayıt → total 0; total ONDALIK TL). region OPSİYONEL (set'liyse gelir).
// PII (name/phone/address) yalnız customers:read + tenant consent ile dolu; aksi halde yalnız { id }.
// Önerilen scope: customers:read.
export async function onCustomerCreated(envelope, ctx = {}) {
  const data = envelope.data;
  const c = data.customer;
  ctx.log?.(`customer.created: ${data.customerId} toplam=${c?.total ?? 0}`);
  // PII consent yoksa name/phone/address undefined olur → '—' ile güvenle yaz (sır/PII loglama).
  ctx.log?.(`  müşteri: ${c?.name ?? '—'} ${c?.phone ?? ''}`);
  // (opsiyonel) en güncel/dolu kaydı Callback API'den çek: const fresh = await ctx.client?.customers.get(data.customerId);
  // CRM/sadakat senkronuna yaz… (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
