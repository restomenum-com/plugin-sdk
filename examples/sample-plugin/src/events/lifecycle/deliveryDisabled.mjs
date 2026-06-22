// delivery.disabled — breaker kesintisiz 72 saat açık kaldı → webhook teslimi KALICI durduruldu.
// envelope.data: { openedAt, disabledAt, hint }. Callback API erişimin SÜRER (düzeltirken veri çekebilirsin) ama push gelmez.
// ⚠️ Bu bildirim endpoint ölü olduğundan ULAŞMAYABİLİR — portal/e-posta uyarısı şart.
export async function onDeliveryDisabled(envelope, ctx = {}) {
  const { openedAt, disabledAt, hint } = envelope.data ?? {};
  ctx.log?.(`delivery.disabled: tenant=${envelope.tenantId} açıldı@${openedAt} durdu@${disabledAt} — ${hint ?? ''}`);
  // Geri açmak: endpoint'i düzelt → portaldan "yeniden etkinleştir" VEYA başarılı test event (breaker'ı otomatik sıfırlar).
  // Bu arada Callback API ile (örn. products/list) durumu senkron tutmaya devam edebilirsin.
}
