// POST /plugin-api/purchases/create — Tek-seferlik (IAP) satın alma başlat. Scope: purchases:write.
// SDK: client.purchases.create({ amount, productKey, description?, idempotencyKey? }) -> CreatePurchaseResult
// Yanıt (gerçek, SDK CreatePurchaseResult): { url, sessionId, purchaseId }.
//   url = Stripe Checkout adresi → tenant'ı buraya YÖNLENDİR (ödeme orada yapılır).
//   amount kuruş (integer); idempotencyKey ile retry-güvenli (aynı anahtar = aynı satın alma).
// Kesin durum webhook'la GELMEZ garanti değil → purchase.granted event'i VEYA purchases/get ile teyit et.
export async function createPurchase(client, { amount, productKey, description, idempotencyKey }) {
  const result = await client.purchases.create({ amount, productKey, description, idempotencyKey });
  // url'i tenant'a sun (redirect/yeni sekme); purchaseId'yi kaydet → granted gelince eşle.
  return result;
}
