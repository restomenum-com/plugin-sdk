// subscription.past_due — yenileme ödemesi alınamadı (gecikmiş). Premium'u KIS (degrade). envelope.data: {} (boş).
// Geri dönüşlüdür: ödeme düzelince subscription.activated gelir → kıstığını tam geri aç.
export async function onSubscriptionPastDue(envelope, ctx = {}) {
  ctx.log?.(`subscription.past_due: tenant=${envelope.tenantId} → premium kısıtlanıyor (degrade, veri korunur)`);
  // Degrade et, SİLME: premium özellikleri kıs ama tenant verisini KORU (silme yalnız app.uninstalled'da).
  // İdempotent: aynı id tekrar gelirse degrade'i yeniden uygulamak no-op olmalı.
}
