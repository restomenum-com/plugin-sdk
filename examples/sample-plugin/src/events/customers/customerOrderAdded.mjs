// customer.order_added — Cari hesaba sipariş yazıldı / veresiye (canlı). Müşterinin açık hesabına ürün eklendi.
// envelope.data (gerçek): { customerId, customer, orders[], amount, balance }
//   customer = allowlist { id, name?(PII), phone?(PII), address?(PII), total } (region OPSİYONEL).
//   orders[] = müşteri-event satırı: { id, title, quantity, options[](string), extra, note, lineTotal } — 'note' VAR, 'discount' YOK;
//     paket/masa satırından FARKLI (paket: discount var, note yok). Tutarlar ONDALIK TL (ör. lineTotal 9.9).
//   amount = bu işlemde eklenen tutar (ondalık TL); balance = total - paid (işlem sonrası kalan bakiye).
// envelope.id (kalem-bazlı, dedup için): <customerId>_addorder_<sıralı satır id'leri, ayraçsız bitişik>.
// PII (name/phone/address) yalnız customers:read + tenant consent ile dolu; aksi halde yalnız { id }.
// Önerilen scope: customers:read.
export async function onCustomerOrderAdded(envelope, ctx = {}) {
  const data = envelope.data;
  const c = data.customer;
  ctx.log?.(`customer.order_added: ${data.customerId} tutar=${data.amount} bakiye=${data.balance} satır=${data.orders?.length ?? 0}`);
  // orders[] müşteri-event satırı (note var, discount yok) — title/quantity/lineTotal üzerinden işle.
  for (const o of data.orders ?? []) ctx.log?.(`  ${o.title} x${o.quantity} = ${o.lineTotal}`);
  // PII consent yoksa name/phone undefined → '—' ile güvenle yaz.
  ctx.log?.(`  müşteri: ${c?.name ?? '—'} ${c?.phone ?? ''}`);
  // Veresiye/cari muhasebesini güncelle (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
