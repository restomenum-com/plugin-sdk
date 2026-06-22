// src/events/paymentMethods/paymentMethodCreated.mjs
// payment_method.created — Ödeme YÖNTEMİ tanımı eklendi (canlı). Yöntem kataloğu değişimi; payment.added (siparişe ödeme) ile KARIŞTIRMA.
// envelope.data (gerçek): { id, title, description, cash(bool), noreport(bool) }. 'users' (iç personel uid listesi) ASLA gelmez.
// Önerilen scope: payment_methods:read. data yalnız bu scope onaylıysa dolu gelir; yoksa {} (alanlar undefined).
export async function onPaymentMethodCreated(envelope, ctx = {}) {
  const data = envelope.data;
  // noreport=true → rapor dışı; mutabakat/raporlama eklentisinde ayrı ele al.
  ctx.log?.(`payment_method.created: ${data.id} "${data.title}" nakit=${data.cash} raporDışı=${data.noreport}`);
  // (opsiyonel) güncel tam listeyi Callback API'den çek: const all = await ctx.client?.paymentMethods.list();
  // Yöntem id'si sipariş ödemesindeki yöntem referansıyla eşleşir → mutabakat tablosuna ekle… (idempotency: envelope.id ile dedup).
}
