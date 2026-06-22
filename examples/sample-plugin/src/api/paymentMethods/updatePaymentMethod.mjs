// src/api/paymentMethods/updatePaymentMethod.mjs
// POST /plugin-api/payment-methods/update — Ödeme yöntemi tanımını günceller. Scope: payment_methods:write.
// SDK: client.paymentMethods.update(body) -> PaymentMethod
// Gövde (gerçek, docs): { id } + title/description/cash/noreport'tan EN AZ BİRİ. Sahiplik kontrollü (notOwned → yalnız kendi oluşturduğun yöntem).
// Yanıt: list ile aynı şekil → { id, title, description, cash, noreport }.
export async function updatePaymentMethod(client, body) {
  // body = { id, ...değişen alanlar }. Çağıran en az bir düzenlenebilir alanı (title/description/cash/noreport) vermeli.
  const updated = await client.paymentMethods.update(body);
  return updated;
}
