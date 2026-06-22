// POST /plugin-api/tables/update-payments — Masanın TÜM ödemelerini değiştirir (FULL REPLACE; masayı KAPATMAZ). Scope: orders:write.
// SDK: client.tables.updatePayments(body) -> { tableId, paid }.
// Gövde (gerçek, bkz. docs/api/tables-update-payments; packets/update-payments ile birebir):
//   { tableId(zorunlu, açık masa doc id), payments[]{ price, id, title?, isDiscount? } }
// Normal satır: id tenant'ın gerçek ödeme yöntemi OLMALI (title/cash/noreport kayıttan türetilir). İndirim (isDiscount:true): serbest id, title ZORUNLU.
export async function updateTablePayments(client, tableId, payments) {
  // payments masanın TÜM ödemelerini değiştirir (merge değil). Önce payment-methods/list ile geçerli id'leri al.
  const body = { tableId, payments };
  const r = await client.tables.updatePayments(body);
  // Yeni paid total'ı aşarsa 400 (Paid exceeds total). Bilinmeyen yöntem id'si → unknown_payment_method.
  return r;
}
