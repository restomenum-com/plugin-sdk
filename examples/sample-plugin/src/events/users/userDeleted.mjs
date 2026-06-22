// user.deleted — Personel (staff) silindi (canlı). Tüm silme yollarını yakalar (admin/sistem hesapları gönderilmez).
// envelope.data (gerçek): { id, name?(PII) } — silinen personelin id'si (her zaman) + name (PII, consent ile).
//   consent yoksa name kırpılır → { id }; users:read scope hiç yoksa data boş → {}.
// Önerilen scope: users:read (PII).
export async function onUserDeleted(envelope, ctx = {}) {
  const data = envelope.data;
  // name PII'dir; consent yoksa undefined olur → '—' ile güvenle yaz (sır/PII loglama).
  ctx.log?.(`user.deleted: ${data.id} ad=${data.name ?? '—'}`);
  // Yerel personel kaydını pasifleştir/sil… (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
