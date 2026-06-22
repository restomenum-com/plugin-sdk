// src/api/paymentMethods/createPaymentMethod.mjs
// POST /plugin-api/payment-methods/create — Yeni ödeme yöntemi tanımı oluşturur. Scope: payment_methods:write.
// SDK: client.paymentMethods.create(body) -> PaymentMethod
// Gövde (gerçek, docs): { title(ZORUNLU 2..100), description?(<=500), cash?(default false), noreport?(default false), idempotencyKey? }
// Yanıt: list ile aynı şekil → { id, title, description, cash, noreport }.
export async function createPaymentMethod(client, { title, description, cash = false, noreport = false, idempotencyKey } = {}) {
  // Yöntemi kullanabilecek personel listesi API'den YAZILAMAZ — yeni yöntem kısıtsız oluşur, atama panelden yapılır.
  const body = { title, description, cash, noreport };
  if (idempotencyKey) body.idempotencyKey = idempotencyKey; // retry'da çift kayıt önler.
  const created = await client.paymentMethods.create(body);
  return created;
}
