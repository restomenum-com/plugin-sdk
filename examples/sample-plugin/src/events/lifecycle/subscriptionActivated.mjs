// subscription.activated — abonelik aktif/trial oldu (aktivasyonda + HER yenilemede). Premium'u BUNUNLA aç.
// envelope.data: { interval, currentPeriodEnd }. interval = fatura periyodu ("monthly"); currentPeriodEnd = dönem bitişi (unix ms).
// ⚠️ AYNI abonelik için BİRDEN ÇOK kez (FARKLI id'lerle) gelir — retry değil. id ile dedup bunları BİRLEŞTİRMEZ.
export async function onSubscriptionActivated(envelope, ctx = {}) {
  const { interval, currentPeriodEnd } = envelope.data ?? {};
  ctx.log?.(`subscription.activated: tenant=${envelope.tenantId} periyot=${interval} bitiş=${currentPeriodEnd}`);
  // İdempotent: event SAYISINA değil tenantId DURUMUNA göre "aktif" set et (kaç kez gelirse sonuç aynı).
  // currentPeriodEnd'i sakla → erişimi buna kadar ver. Tek-seferlik yan etkileri (hoşgeldin maili) yalnız İLK aktivasyonda çalıştır.
}
