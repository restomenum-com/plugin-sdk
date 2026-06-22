// src/events/paymentMethods/paymentMethodUpdated.mjs
// payment_method.updated — Ödeme yöntemi tanımı güncellendi (canlı). data = yöntemin GÜNCEL hâli (diff değil, tam snapshot).
// envelope.data (gerçek): { id, title, description, cash(bool), noreport(bool) }. created ile aynı şekil, yalnız type farklı.
// Önerilen scope: payment_methods:read. data yalnız bu scope onaylıysa dolu; yoksa {}.
export async function onPaymentMethodUpdated(envelope, ctx = {}) {
  const data = envelope.data;
  // Güncel hâl geldiği için yerel kopyayı id ile upsert et (created/updated aynı handler mantığı paylaşabilir).
  ctx.log?.(`payment_method.updated: ${data.id} "${data.title}" nakit=${data.cash} raporDışı=${data.noreport}`);
  // (opsiyonel) doğrulama için en güncel listeyi çek: const all = await ctx.client?.paymentMethods.list();
}
