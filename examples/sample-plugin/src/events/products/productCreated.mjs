// product.created — Ürün oluşturuldu (canlı). Katalogda yeni ürün açıldı.
// envelope.data (gerçek): { id, title, category(kategori ID'si — ad değil), price, tax, active,
//   image(CDN URL|null), barcode, barcodeType, stock, languages?, options[]{ id?, title, min, max, multiple, choices[]{ id, title, price } } }
// created/updated/deleted aynı şekil; yalnız type farklı. NOT: cost/recete ASLA gelmez (ticari sır).
// Önerilen scope: products:read.
export async function onProductCreated(envelope, ctx = {}) {
  const data = envelope.data;
  ctx.log?.(`product.created: ${data.id} "${data.title}" fiyat=${data.price} kategori=${data.category}`);
  // Eski/legacy kayıtlarda alan tümden düşebilir → ?. / varsayılan ile oku (tax ?? 0, stock ?? 0).
  ctx.log?.(`  aktif=${data.active} stok=${data.stock ?? 0} kdv=${data.tax ?? 0}`);
  // options[].min/max bazı kayıtlarda string gelebilir; choices[].id number — dayanıklı parse et.
  if (data.options?.length) ctx.log?.(`  ${data.options.length} seçenek grubu`);
  // (opsiyonel) tam/güncel ürünü Callback API'den çek: const fresh = await ctx.client?.products.get(data.id);
  // Kendi menü aynanı güncelle… (idempotency webhookRoute'ta envelope.id ile sağlanır).
}
