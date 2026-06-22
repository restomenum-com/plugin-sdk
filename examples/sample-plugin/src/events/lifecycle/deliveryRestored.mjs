// delivery.restored — breaker kapandı, teslimler normale döndü (başarılı probe / portal yeniden-etkinleştirme / test-emit).
// envelope.data: { restoredAt }. Bilgilendirme amaçlı; özel aksiyon gerekmez. 1 saatlik debounce (art arda aç/kapa → tek bildirim).
export async function onDeliveryRestored(envelope, ctx = {}) {
  ctx.log?.(`delivery.restored: tenant=${envelope.tenantId} normale döndü@${envelope.data?.restoredAt}`);
  // Bilgi amaçlı — istersen iç alarmını kapat/normale al. İdempotent: aynı id tekrar gelirse no-op.
}
