// packet.closed — Paket kapatıldı (canlı). Paket teslim edilip finansal kapanış oldu.
// envelope.id = packetclosed_<serverId><packetId> (deterministik → dedup'ta kullanışlı).
// envelope.data (gerçek): { packetId, docNo, channel("PACKET"…), entegrasyon(string kanal kodu), status("Delivered"…), note?, paymentNote?, total, paid, totalDiscount, orders[], customer?(PII) }
// Önerilen scope: orders:read.
export async function onPacketClosed(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`packet.closed: ${data.packetId} durum=${data.status ?? '—'} ödenen=${data.paid}/${data.total}`);
  // channel = kanal sınıfı ("PACKET"…); entegrasyon = kaynak kanal kodu. status kapanışta dolu gelir.
  ctx.log?.(`  kanal=${data.channel} entegrasyon=${data.entegrasyon} kalem=${data.orders?.length ?? 0}`);
  // Müşteri PII'si customers:read + consent ile dolu gelir; yoksa alanlar undefined/null olabilir (id/region kalır).
  if (data.customer) ctx.log?.(`  müşteri: ${data.customer.name ?? '—'} ${data.customer.phone ?? ''}`);
  // Kapanış nihaidir → muhasebe/raporlamayı burada işle; dedup envelope.id ile (kapanış tekrar teslim edilebilir).
}
