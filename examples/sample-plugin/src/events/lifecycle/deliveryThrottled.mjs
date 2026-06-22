// delivery.throttled — teslim hacmin kurulum cap'ini (120/dk; toplu ürün/kategori 60/dk) aştı; aşan teslimler düşürüldü (dropped).
// envelope.data: { cls, count, eventType, hint }. cls = aşılan kova; count = düşen teslim sayısı; eventType = en çok düşen tip.
// Lifecycle event'leri (uninstall/billing/sağlık/redact) bu sınırlardan MUAFTIR.
export async function onDeliveryThrottled(envelope, ctx = {}) {
  const { cls, count, eventType, hint } = envelope.data ?? {};
  ctx.log?.(`delivery.throttled: tenant=${envelope.tenantId} sınıf=${cls} düşen=${count} tip=${eventType ?? '-'} — ${hint ?? ''}`);
  // Aksiyon: toplu yazma/güncellemeleri grupla, hacmi düşür. Düşen teslimleri Callback API ile telafi et (products/list ile yeniden senkronla).
}
