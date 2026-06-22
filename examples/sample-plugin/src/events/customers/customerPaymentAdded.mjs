// customer.payment_added — Cari hesaptan tahsilat yapıldı (canlı). Açık hesaba ödeme/tahsilat işlendi.
// envelope.data (gerçek): { customerId, customer, amount, method, balance, orders[], note? }
//   customer = allowlist { id, name?(PII), phone?(PII), address?(PII), total } (region OPSİYONEL).
//   method = ödeme yöntemi (iç flag'ler çıkarılmış): { id, title } — noreport/cash gibi iç alanlar dönmez.
//   amount = tahsil edilen tutar ONDALIK TL (amount<=0 → event yok); balance = işlem sonrası kalan bakiye (ondalık TL).
//   orders[] = string id dizisi: toplu tahsilatta [] (lump-sum), kalem-bazlıda ödenen satır id'leri.
// envelope.id (dedup): toplu tahsilat <customerId>_addpayment_<ödeme id>; kalem-bazlı payorders_<paymentId>_<ödenen satır id'leri>.
// PII (name/phone/address) yalnız customers:read + tenant consent ile dolu; aksi halde yalnız { id }.
// Önerilen scope: customers:read.
export async function onCustomerPaymentAdded(envelope, ctx = {}) {
  const data = envelope.data;
  const c = data.customer;
  ctx.log?.(`customer.payment_added: ${data.customerId} tutar=${data.amount} yöntem=${data.method?.title ?? '—'} bakiye=${data.balance}`);
  // orders[] = string id dizisi (dolu satır objesi DEĞİL); toplu tahsilatta boş gelir.
  ctx.log?.(`  ödenen satır=${data.orders?.length ?? 0} not=${data.note ?? ''}`);
  // PII consent yoksa name/phone undefined → '—' ile güvenle yaz.
  ctx.log?.(`  müşteri: ${c?.name ?? '—'} ${c?.phone ?? ''}`);
  // Tahsilatı cari muhasebesine işle (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
