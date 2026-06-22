// purchase.granted — IAP satın alma tamamlandı; erişimi AÇ (premium kilidi vb.). Önerilen scope: purchases:read.
// envelope.id (deterministik, dedup için): <purchaseId>_granted.
// envelope.data (gerçek): { purchaseId, pluginId, type, productKey, amount, currency }.
//   PII YOK — yalnız finansal/operasyonel alanlar. Webhook bir KOLAYLIK bildirimidir; kesin/authoritative
//   durum için purchases/get ile teyit et (özellikle erişim açmadan önce kritik akışlarda).
export async function onPurchaseGranted(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`purchase.granted: ${data.purchaseId} ürün=${data.productKey} tutar=${data.amount} ${data.currency}`);
  // İdempotent erişim açma: aynı <purchaseId>_granted ikinci kez gelse de tek kez uygula
  // (dedup webhookRoute'ta envelope.id ile sağlanır; iş tarafında da productKey→tenant eşlemesi tekil olmalı).
  // ctx.client varsa kesin durumu doğrula (opsiyonel, kritik akışta önerilir):
  //   const fresh = await ctx.client.purchases.get(data.purchaseId);
  //   if (fresh.status !== 'granted') return; // yarış/şüphe → açma
  ctx.log?.(`  → erişim aç: ${data.productKey} (tenant ${envelope.tenantId})`);
}
