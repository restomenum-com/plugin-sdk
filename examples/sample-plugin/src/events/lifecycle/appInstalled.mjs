// app.installed — OAuth connect tamamlandı (kurulumun İLK sinyali). Lifecycle: abonelik/scope GEREKMEZ,
// bağlı her kuruluma gelir (packet.created ile aynı webhookUrl + aynı HMAC). envelope.data: { version, scopes[] }.
//   version = kurulan eklenti sürümü (semver); scopes = tenant'ın ONAYLADIĞI scope listesi.
// Provision'ı BURADA yap; premium'u BURADA AÇMA (install ≠ ödeme → premium subscription.activated ile açılır).
export async function onAppInstalled(envelope, ctx = {}) {
  const { version, scopes = [] } = envelope.data ?? {};
  ctx.log?.(`app.installed: tenant=${envelope.tenantId} sürüm=${version} scopes=${scopes.join(',')}`);
  // İdempotent provision: retry'da aynı id ikinci kez gelirse tenant'ı YENİDEN oluşturma — var olanı güncelle/no-op.
  // Onaylanan scopes[]'i sakla → yetkilerini buna göre sınırla (eksik scope = graceful degrade). version'ı migrasyon için kaydet.
}
