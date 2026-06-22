// subscription.canceled — abonelik iptal edildi. Premium yetkiyi KAPAT (deprovision). envelope.data: { reason? }.
//   reason === "plugin_now_free" → eklenti ÜCRETSİZE geçirildi: abonelik iptal ama erişim ücretsiz SÜRÜYOR →
//   DEPROVISION ETME, yalnız premium kapıları kaldır. Alan yoksa normal iptal (deprovision et).
// Tenant hâlâ bağlı olabilir → veri SİLME (silme app.uninstalled işidir).
export async function onSubscriptionCanceled(envelope, ctx = {}) {
  const reason = envelope.data?.reason;
  if (reason === 'plugin_now_free') {
    ctx.log?.(`subscription.canceled: tenant=${envelope.tenantId} reason=plugin_now_free → premium kapıları kaldır, erişim ücretsiz sürüyor`);
    return; // deprovision YOK — yalnız premium kilitlerini kaldır
  }
  ctx.log?.(`subscription.canceled: tenant=${envelope.tenantId} → premium kapatılıyor (deprovision, veri korunur)`);
  // İdempotent: aynı id tekrar gelirse deprovision tekrarı no-op. Erişim politikanı currentPeriodEnd'e göre kur.
}
