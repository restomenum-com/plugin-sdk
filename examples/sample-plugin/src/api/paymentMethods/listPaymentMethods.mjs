// src/api/paymentMethods/listPaymentMethods.mjs
// GET /plugin-api/payment-methods/list — Mağazanın tanımlı ödeme yöntemleri (Nakit, Kredi Kartı, Yemek Çeki…). Scope: payment_methods:read.
// SDK: client.paymentMethods.list() -> PaymentMethod[]  (envelope açılır; doğrudan dizi döner)
// Yanıt (gerçek, her eleman): { id, title, description, cash(bool), noreport(bool) }. Parametre yok — tüm yöntemler döner.
export async function listPaymentMethods(client) {
  const methods = await client.paymentMethods.list();
  // 'users' (yöntemi kullanabilen personel uid listesi = iç erişim kontrolü) ve iç timestamp'ler (c/u) ASLA dönmez.
  // noreport=true olanlar rapor dışı; mutabakatta ayrıştır. id, sipariş ödemesindeki yöntem referansıyla eşleşir.
  return methods;
}
