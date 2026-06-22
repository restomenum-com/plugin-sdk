// user.created — Personel (staff) oluşturuldu (canlı). Yeni kullanıcı kaydı açıldı.
// envelope.data (gerçek): { id, name?(PII) } — id her zaman; name yalnız users:read + tenant consent ile dolu.
//   consent yoksa name kırpılır → { id }; users:read scope hiç yoksa data boş → {}.
// id = hook/action actor.userId ve users/get id'si ile aynı (etkileşimi yapan kullanıcıyı eşle).
// Önerilen scope: users:read (PII).
export async function onUserCreated(envelope, ctx = {}) {
  const data = envelope.data;
  // name PII'dir; consent yoksa undefined olur → '—' ile güvenle yaz (sır/PII loglama).
  ctx.log?.(`user.created: ${data.id} ad=${data.name ?? '—'}`);
  // (opsiyonel) güncel tam personel listesini Callback API'den çek: const users = await ctx.client?.users.get();
  // Yetki/personel senkronuna yaz… (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
