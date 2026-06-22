// app.uninstalled — kurulum kaldırıldı; TEK temizlik sinyali. Lifecycle (abonelik/scope gerekmez). envelope.data: {} (boş).
// KRİTİK: bu tenant'a ait TÜM veriyi SİL (GDPR) — sonrasında bu tenant için webhook gelmez.
export async function onAppUninstalled(envelope, ctx = {}) {
  ctx.log?.(`app.uninstalled: tenant=${envelope.tenantId} → tüm tenant verisi silinecek (GDPR)`);
  // İdempotent purge: aynı id (retry) tekrar gelirse hata verme, no-op. Bu tenant'ın webhookSecret'ını geçersiz say.
  // Silmeyi async kuyruğa al ve HIZLI 200 dön (uzun silmeyi webhook isteğinde bekletme).
}
