// GET /plugin-api/users/get — Personel (staff) listesi. Scope: users:read (PII).
// SDK: client.users.get() -> Array<{ id, name? }>  (parametresiz; en fazla 200 kayıt döner)
// Yanıt (gerçek): { success: true, data: [ { id, name?(PII) } ] }
//   PII consent verildiyse name dolu; consent yoksa yalnız { id } (ad gizli).
//   pincode/authority/email/mesai/storages KASITLI dönmez — yanıtta hiç yer almaz.
export async function getUsers(client) {
  const users = await client.users.get();
  // Liste sık değişmez → kendi tarafında cache'le, sık çağırma (rate limit). name null/undefined olabilir.
  return users;
}
