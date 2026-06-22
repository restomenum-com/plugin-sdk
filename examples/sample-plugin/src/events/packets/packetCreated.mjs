// packet.created — Paket oluşturuldu (canlı). Yeni teslimat/paket siparişi düştü.
// envelope.data (gerçek): { packetId, docNo, orderCode?, total, paid, totalDiscount, paymentNote?, isScheduled?, scheduledDate?, note?, entegrasyon(string kanal kodu: packet|yemeksepeti|getir|trendyol…), orders[], customer?(PII), callbackUrls?(packets:status: pickup/delivered/cancel) }
// Önerilen scope: orders:read.
export async function onPacketCreated(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`packet.created: ${data.packetId} kanal=${data.entegrasyon} tutar=${data.total} ürün=${data.orders?.length ?? 0}`);
  // entegrasyon STRING kanal kodudur (obje değil); orderCode yalnız entegrasyon siparişlerinde gelir.
  if (data.orderCode) ctx.log?.(`  platform sipariş kodu: ${data.orderCode}`);
  // İleri tarihli teslim: scheduledDate epoch ms (yalnız isScheduled:true ile dolu).
  if (data.isScheduled) ctx.log?.(`  ileri tarihli teslim: ${data.scheduledDate}`);
  // Müşteri PII'si customers:read + consent ile dolu gelir; yoksa name/phone/address undefined olabilir (region/id kalır).
  if (data.customer) ctx.log?.(`  müşteri: ${data.customer.name ?? '—'} ${data.customer.phone ?? ''}`);
  // callbackUrls yalnız packets:status scope'u ile eklenir → teslim/iptal statüsünü bunlarla setlersin.
  // (opsiyonel) en güncel/dolu paketi Callback API'den çek: const fresh = await ctx.client?.packets.get(data.packetId);
  // Kuryeye/dış sisteme ilet… (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
