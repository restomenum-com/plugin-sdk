// user.updated — Personel (staff) düzenlendi (canlı). Güncel hâl gönderilir (diff değil).
// envelope.data (gerçek): { id, name?(PII) } — id her zaman; name yalnız users:read + tenant consent ile dolu.
//   consent yoksa name kırpılır → { id }; users:read scope hiç yoksa data boş → {}.
// Şekil user.created ile aynı; yalnız type farklı (personelin güncel adı/kaydı).
// Önerilen scope: users:read (PII).
export async function onUserUpdated(envelope, ctx = {}) {
  const data = envelope.data;
  // name PII'dir; consent yoksa undefined olur → '—' ile güvenle yaz (sır/PII loglama).
  ctx.log?.(`user.updated: ${data.id} ad=${data.name ?? '—'}`);
  // (opsiyonel) tam/güncel listeyi Callback API'den doğrula: const users = await ctx.client?.users.get();
  // Yerel personel kaydını güncelle… (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
