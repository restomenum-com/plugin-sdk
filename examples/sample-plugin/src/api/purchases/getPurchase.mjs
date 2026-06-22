// GET /plugin-api/purchases/get?purchaseId= — Satın alma durumu (authoritative). Scope: purchases:read.
// SDK: client.purchases.get(purchaseId) -> Purchase
// Yanıt (gerçek, SDK Purchase modeli):
//   { purchaseId, status, type, productKey, amount, currency, createdAt, paidAt|null, grantedAt|null, refundedAt|null }
//   status: pending → paid → granted (iade: refunded). Finansal/Stripe alanları SIZMAZ.
// Erişimi yalnız status==='granted' (veya grantedAt!=null) iken aç — pending'de açma.
export async function getPurchase(client, purchaseId) {
  const purchase = await client.purchases.get(purchaseId);
  const isGranted = purchase.status === 'granted' || purchase.grantedAt != null;
  return { purchase, isGranted };
}
