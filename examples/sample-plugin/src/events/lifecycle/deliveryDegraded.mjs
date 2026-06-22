// delivery.degraded — circuit breaker açıldı (endpoint art arda başarısız); teslimler geçici atlanıyor (skipped).
// envelope.data: { consecutiveDead, windowFail, windowOk, openedAt, hint }. 6 saatte bir gönderilir.
// ⚠️ Bu bildirimin kendisi de webhook'a gider — endpoint ölüyse ULAŞMAYABİLİR; gerçek uyarı kanalı portal/e-posta.
export async function onDeliveryDegraded(envelope, ctx = {}) {
  const { consecutiveDead, windowFail, windowOk, hint } = envelope.data ?? {};
  ctx.log?.(`delivery.degraded: tenant=${envelope.tenantId} dead=${consecutiveDead} fail=${windowFail} ok=${windowOk} — ${hint ?? ''}`);
  // Aksiyon: endpoint sağlığını DÜZELT. Düzeltince cooldown beklemeden açmak için: portaldan "yeniden etkinleştir"
  // veya başarılı bir test event (breaker otomatik sıfırlanır). failMode:closed hook varsa breaker açıkken hook anında deny olur.
}
