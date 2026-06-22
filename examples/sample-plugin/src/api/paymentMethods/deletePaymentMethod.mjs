// src/api/paymentMethods/deletePaymentMethod.mjs
// POST /plugin-api/payment-methods/delete — Ödeme yöntemi tanımını siler. Scope: payment_methods:write.
// SDK: client.paymentMethods.delete(body) -> { id, deleted }
// Gövde (gerçek, docs): { id }. Sahiplik kontrollü. Yanıt (200): { id, deleted: true }.
export async function deletePaymentMethod(client, id) {
  const r = await client.paymentMethods.delete({ id });
  // r.deleted === true ise silme başarılı. Yerel kopyadan da id ile kaldır (idempotent: ikinci silme zararsız olmalı).
  return r;
}
