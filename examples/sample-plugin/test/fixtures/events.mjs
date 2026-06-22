// Gerçek örnek webhook payload'ları (fixtures) — yerel `npm run test:events` için.
// Kaynak: portal docs event kataloğu ("canlı"/teyitli payload'lar). UYDURMA DEĞİL — alanlar gerçek şekildir.
// Her giriş TAM zarftır: { id, type, version, tenantId, occurredAt, data }. tenantId = test sabiti.
const TENANT = 'tnt_test';
const env = (type, data, id) => ({ id, type, version: '1', tenantId: TENANT, occurredAt: 1781000000000, data });

// product.* — created/updated/deleted AYNI 'data' şekli; yalnız type farklı.
const productData = {
  id: '3b5d-f6d0', title: 'Menemen', category: 'a0-62', price: 19, tax: 0, active: true,
  image: 'https://cdn.example/products/original.jpeg', barcode: '', barcodeType: 'Product', stock: 59,
  languages: { US: { title: 'Menemen', description: '' } },
  options: [{ id: 1780871104983, title: '', min: 0, max: 99, multiple: true, choices: [
    { id: 1661781517624, title: 'Sade', price: 0 }, { id: 1661781517374, title: 'Peynir', price: 1 },
    { id: 1661781517278, title: 'Kavurma', price: 5 }, { id: 1661781517482, title: 'Sucuk', price: 2 },
  ] }],
};
const categoryData = { id: 'a0-0c', title: 'SOĞUK İÇECEKLER', image: 'https://cdn.example/category/original.jpeg', rank: 2, active: true, languages: {} };
const userData = { id: 'lZz6BqN46Og4HKrhjf6eflOgWnA2', name: 'Test User' };
const paymentMethodData = { id: 'ab-12', title: 'Kredi Kartı', description: 'POS cihazı', cash: false, noreport: false };
const ingredientData = { id: 'ab-12', title: 'Domates', unit: 'kg', stock: 42, alert: 5, tax: 1 };
// customer allowlist (CANLI): { id, name, phone, address, total } — region YOK (opsiyonel; müşteride set'liyse gelir). PII = name/phone/address. total ONDALIK TL.
const customerSnap = (total) => ({ id: 'cust_001', name: 'Ahmet Yılmaz', phone: '5551234567', address: 'Atatürk Cad. No:5', total });
// NOT: paket/masa order satırı = { …, discount, lineTotal } (note yok); müşteri-event order satırı = { …, note, lineTotal } (discount yok) — FARKLI. Bu const paket/masa içindir.
const orderLine = { id: 'masa-1-ab', title: 'Menemen', quantity: 2, options: [], extra: 0, discount: 0, note: '', lineTotal: 38 };

export const EVENT_FIXTURES = [
  env('table.created', { tableId: 'masa-1', tableName: 'Masa 1', docNo: 12, desing: 'Bahçe', location: 'Masa 1', personCount: 2, customer: null, orders: [orderLine], total: 38, paid: 0, totalDiscount: 0 }, 'evt_table_created_1'),
  env('table.closed', { tableId: 'e4356402-aaaa', tableName: 'Masa 1', docNo: 5, desing: 'Bahçe', location: 'Masa 1', personCount: 0, orders: [{ id: 'masa-1-f308', title: 'Bellavista', quantity: 1, options: [], extra: 0, discount: 0, note: '', lineTotal: 13 }, { id: 'masa-1-4724', title: 'dondurma', quantity: 1, options: ['çilek', 'oreo'], lineTotal: 4 }], total: 17, paid: 17, totalDiscount: 0, status: null, channel: 'TABLE' }, 'tableclosed_test_5'),
  env('packet.created', { packetId: '1780633662954', docNo: 42, orderCode: 'A12', total: 145, paid: 0, totalDiscount: 0, paymentNote: 'Kapıda nakit', isScheduled: false, scheduledDate: null, note: 'Zili çalma', entegrasyon: 'packet', orders: [{ id: 'ord_1', title: 'Lahmacun', quantity: 2, options: ['Acılı', 'Bol soğan'], extra: 0, discount: 0, note: '', lineTotal: 60, product: { title: 'Lahmacun' } }], customer: { id: 'cust_9', name: 'Ahmet Yılmaz', phone: '05xxxxxxxxx', address: 'Atatürk Cad. No:5', addressDescription: '2. kat', region: 'Kadıköy', call: '05xxxxxxxxx' } }, 'evt_packet_created_1'),
  env('packet.closed', { packetId: 'YJyvBuxjDA31kdc7E3KQ', docNo: 3, channel: 'PACKET', entegrasyon: 'packet', status: 'Delivered', note: 'Sipariş Notu', paymentNote: 'nakit', total: 17, paid: 17, totalDiscount: 0, orders: [{ id: '1780875078783-32e1', title: 'Bellavista', quantity: 1, options: [], extra: 0, discount: 0, note: '', lineTotal: 13 }, { id: '1780875078783-4e12', title: 'dondurma', quantity: 1, options: ['çilek'], extra: 0, discount: 0, note: '', lineTotal: 4 }], customer: { id: '123456', name: 'Ahmet Bayrak', region: null, address: 'Adres', addressDescription: null, phone: '123456', call: '123456', latitude: null, longitude: null } }, 'packetclosed_test_1'),
  env('product.created', productData, 'evt_product_created_1'),
  env('product.updated', productData, 'evt_product_updated_1'),
  env('product.deleted', productData, 'evt_product_deleted_1'),
  env('category.created', categoryData, 'evt_category_created_1'),
  env('category.updated', categoryData, 'evt_category_updated_1'),
  env('category.deleted', categoryData, 'evt_category_deleted_1'),
  env('user.created', userData, 'evt_user_created_1'),
  env('user.updated', userData, 'evt_user_updated_1'),
  env('user.deleted', userData, 'evt_user_deleted_1'),
  env('customer.created', { customerId: 'cust_001', customer: customerSnap(0) }, 'evt_customer_created_1'),
  env('customer.updated', { customerId: 'cust_001', customer: customerSnap(0) }, 'evt_customer_updated_1'),
  // order_added orders[] satırı (CANLI): { id, title, quantity, options, extra, note, lineTotal } — 'note' VAR, 'discount' YOK; paket/masa satırından FARKLI. Tutarlar ONDALIK TL. id = <customerId>_addorder_<lineId'ler ayraçsız bitişik>.
  env('customer.order_added', { customerId: 'cust_001', customer: customerSnap(46.41), orders: [{ id: 'order_line_001', title: 'Espresso', quantity: 1, options: [], extra: 0, note: '', lineTotal: 9.9 }, { id: 'order_line_002', title: 'Cortado', quantity: 1, options: [], extra: 0, note: '', lineTotal: 13.9 }], amount: 23.8, balance: 36.41 }, 'cust_001_addorder_order_line_001order_line_002'),
  // payment_added: amount/balance ONDALIK TL; orders[] = string id dizisi (toplu tahsilatta []). id = <customerId>_addpayment_<ödeme id>.
  env('customer.payment_added', { customerId: 'cust_001', customer: customerSnap(46.41), amount: 36.41, method: { id: 'a2-cash', title: 'nakit' }, balance: 0, orders: [], note: '' }, 'cust_001_addpayment_pay_77'),
  env('payment_method.created', paymentMethodData, 'evt_pm_created_1'),
  env('payment_method.updated', paymentMethodData, 'evt_pm_updated_1'),
  env('payment_method.deleted', paymentMethodData, 'evt_pm_deleted_1'),
  env('ingredient.created', ingredientData, 'evt_ing_created_1'),
  env('ingredient.updated', ingredientData, 'evt_ing_updated_1'),
  env('ingredient.deleted', ingredientData, 'evt_ing_deleted_1'),
  // purchase.granted — IAP satın alma tamamlandı (data PII'siz; id = <purchaseId>_granted, deterministik).
  env('purchase.granted', { purchaseId: '9b1f2c3d', pluginId: 'plugin_abc', type: 'one_time', productKey: 'premium_unlock', amount: 10000, currency: 'try' }, '9b1f2c3d_granted'),

  // ── Lifecycle webhook'ları — abonelik/scope GEREKMEZ; bağlı her kuruluma gelir. Payload'lar gerçek (frontend lib/lifecycle.ts). ──
  env('app.installed', { version: '1.1.3', scopes: ['orders:read', 'hooks:table.close'] }, 'evt_app_installed_1'),
  env('app.uninstalled', {}, 'evt_app_uninstalled_1'),
  env('subscription.activated', { interval: 'monthly', currentPeriodEnd: 1783374777006 }, 'evt_sub_activated_1'),
  env('subscription.past_due', {}, 'evt_sub_pastdue_1'),
  env('subscription.canceled', {}, 'evt_sub_canceled_1'),
  env('customer.redact', { customerId: 'cust-123', deletedAt: 1781200000000 }, 'evt_customer_redact_1'),
  env('delivery.degraded', { consecutiveDead: 10, windowFail: 22, windowOk: 1, openedAt: 1781200000000, hint: 'Endpoint art arda başarısız; düzeltip test event gönderin.' }, 'evt_delivery_degraded_1'),
  env('delivery.restored', { restoredAt: 1781205000000 }, 'evt_delivery_restored_1'),
  env('delivery.disabled', { openedAt: 1781000000000, disabledAt: 1781259200000, hint: 'Endpoint düzeldiyse portaldan yeniden etkinleştir veya test event gönder.' }, 'evt_delivery_disabled_1'),
  env('delivery.throttled', { cls: 'bulk', count: 37, eventType: 'product.updated', hint: 'Toplu güncellemeleri sadeleştir veya hacmi düşür.' }, 'evt_delivery_throttled_1'),
];
