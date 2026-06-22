// customer.updated — Müşteri güncellendi (canlı). Tam güncel snapshot gelir (diff değil; eski değer taşımaz).
// envelope.data (gerçek): { customerId, customer } — customer = allowlist şekli
//   { id, name?(PII), phone?(PII), address?(PII), total } (güncel snapshot; total ONDALIK TL). region OPSİYONEL (set'liyse gelir).
// PII (name/phone/address) yalnız customers:read + tenant consent ile dolu; aksi halde yalnız { id }.
// Önerilen scope: customers:read.
export async function onCustomerUpdated(envelope, ctx = {}) {
  const data = envelope.data;
  const c = data.customer;
  ctx.log?.(`customer.updated: ${data.customerId} toplam=${c?.total ?? 0}`);
  // Snapshot olduğundan değişen alanı diff'lemek için yerel önceki kaydınla karşılaştır.
  ctx.log?.(`  müşteri: ${c?.name ?? '—'} ${c?.phone ?? ''}`);
  // (opsiyonel) doğrulama/zenginleştirme için taze çek: const fresh = await ctx.client?.customers.get(data.customerId);
  // CRM kaydını upsert et (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
