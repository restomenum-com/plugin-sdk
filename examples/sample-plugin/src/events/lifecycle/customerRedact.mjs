// customer.redact — tenant bir müşteriyi sildi (GDPR/KVKK). O customerId'ye ait TÜM PII'yi SİL (zorunlu).
// Lifecycle/compliance: PII scope'u onaylı + consent vermiş TÜM kurulumlara gelir (eklenti pasif/borçlu olsa bile,
// veriyi tutuyorsan sinyali alırsın). Uninstall edilmişsen GELMEZ (app.uninstalled zaten tüm tenant verisini sildi).
// envelope.data: { customerId, deletedAt }. Critical sınıf: breaker/cap'ten muaf, 6 denemeli retry.
export async function onCustomerRedact(envelope, ctx = {}) {
  const { customerId, deletedAt } = envelope.data ?? {};
  ctx.log?.(`customer.redact: tenant=${envelope.tenantId} customer=${customerId} silindi@${deletedAt} → tüm PII sil`);
  // ZORUNLU: bu customerId ile eşleşen tüm PII'yi (isim/telefon/adres/e-posta/not) gerçekten sil.
  // İdempotent: aynı customerId birden çok kez gelebilir → envelope.id ile dedup, silme tekrarı no-op.
}
