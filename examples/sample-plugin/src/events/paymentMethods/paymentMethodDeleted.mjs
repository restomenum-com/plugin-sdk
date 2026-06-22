// src/events/paymentMethods/paymentMethodDeleted.mjs
// payment_method.deleted — Ödeme yöntemi tanımı silindi (canlı). data = silinen yöntemin SON hâli.
// envelope.data (gerçek): { id, title, description, cash(bool), noreport(bool) }. created/updated ile aynı şekil, yalnız type farklı.
// Önerilen scope: payment_methods:read. data yalnız bu scope onaylıysa dolu; yoksa {}.
export async function onPaymentMethodDeleted(envelope, ctx = {}) {
  const data = envelope.data;
  // Silme: yerel kopyadan id ile kaldır/işaretle. Geçmiş mutabakat kayıtlarındaki referansı bozma (sadece pasifle).
  ctx.log?.(`payment_method.deleted: ${data.id} "${data.title}"`);
  // Idempotency: aynı id ikinci kez gelirse tekrarlama (at-least-once → dedup, envelope.id ile).
}
