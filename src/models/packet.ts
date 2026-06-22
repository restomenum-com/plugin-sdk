// Paket/masa kanonik şekli — packets/get, packets/open, tables/get ve packet.created `data` aynı aileyi taşır.
// Sözleşme EKLEMELİ (additive) genişler: bilinmeyen alan = yok say (index signature ile ileriye dönük uyum).

// Sipariş kalemi (cart satırı).
export interface OrderLine {
  id: string;
  title: string;
  quantity: number;
  /** Seçenek adları (string array). */
  options?: string[];
  extra?: number;
  discount?: number;
  note?: string;
  /** Satır toplamı (Restomenum hesaplar). */
  lineTotal: number;
  /**
   * Tam ürün objesi — yalnız bazı kanallarda (entegrasyon / ileri tarihli sipariş) eklenir;
   * manuel pakette gelmez. En az `title` taşır.
   */
  product?: { title?: string; [extra: string]: unknown };
  /** İleriye dönük (additive) alanlar — tanımadığın alanı yok say. */
  [extra: string]: unknown;
}

/**
 * Pakete gömülü müşteri — `customers/*` ile **AYNI PII kuralıyla** kırpılır:
 * `customers:read` scope'u + tenant consent yoksa PII alanları (`name`/`phone`/`address`/email/tckn/vergino)
 * silinir; `id` (ve `region`/`call`/`addressDescription`) kalır. Alanları `undefined` varsay.
 */
export interface PacketCustomer {
  id: string;
  /** PII — consent yoksa silinir. */
  name?: string | null;
  /** PII — consent yoksa silinir. */
  phone?: string | null;
  /** Çağrı numarası (telefon benzeri). */
  call?: string | null;
  /** PII — consent yoksa silinir. */
  address?: string | null;
  /** Adres tarifi/not. */
  addressDescription?: string | null;
  /** Kaba bölge etiketi — PII **değil**, consent'siz de gelir. */
  region?: string | null;
  /** İleriye dönük (additive) alanlar. */
  [extra: string]: unknown;
}

// Paket/masa hesabı (packets/get + tables/get response + packet.created `data`).
export interface Packet {
  /**
   * Paket kimliği. Action/iframe etkileşiminde `target.id` ile gelir; `packets.get(packetId)` ile çekilir.
   * (Kanonik ad `packetId`'dir — `id` DEĞİL.)
   */
  packetId: string;
  docNo?: number;
  /** Sipariş kanalı — **STRING kod** (`"packet"` | `"yemeksepeti"` | `"getir"` | `"trendyol"` …), obje DEĞİL. */
  entegrasyon?: string;
  /** Kanal sınıfı (`"PACKET"` | `"TABLE"` …) — bazı yanıtlarda/event'lerde gelir. */
  channel?: string;
  /** Sipariş durumu (örn. `"Delivered"`) — kapanış/güncel durumda dolu, aksi halde `null`. */
  status?: string | null;
  total: number;
  paid: number;
  totalDiscount?: number;
  paymentNote?: string;
  /** Platform sipariş kodu — opsiyonel (entegrasyon kanalları). */
  orderCode?: string;
  /** İleri tarihli teslim mi — opsiyonel. */
  isScheduled?: boolean;
  /** İleri tarihli teslim zamanı (epoch ms) — opsiyonel. */
  scheduledDate?: number | null;
  /** Müşteri/sipariş notu — opsiyonel. */
  note?: string;
  orders: OrderLine[];
  /** Gömülü müşteri — PII-gated (bkz. {@link PacketCustomer}). */
  customer?: PacketCustomer;
  /**
   * İmzalı durum-bildirim URL'leri — YALNIZ `packets:status` scope'u + `packet.created` event'inde gelir
   * (`packet.closed`'da YOK; `packets/get` yanıtında da gelmez). Paket durumunu Restomenum'a bildirmek için
   * ilgili URL'e POST at. URL'ler token + exp taşır (imzalı). Gerçek sandbox event'inden doğrulandı (§18.3).
   */
  callbackUrls?: { pickup: string; delivered: string; cancel: string };
  /** İleriye dönük (additive) alanlar — tanımadığın alanı yok say. */
  [extra: string]: unknown;
}

// packets/open — açık paket ÖZETİ (orders/customer DEĞİL → itemCount). (Gerçek yanıttan doğrulandı.)
export interface PacketSummary {
  packetId: string;
  docNo?: number;
  /** Sipariş kanalı — string kod ("packet" | "yemeksepeti" …). */
  entegrasyon?: string;
  /** Açık paketteki kalem adedi. */
  itemCount: number;
  total: number;
  paid: number;
  totalDiscount?: number;
  [extra: string]: unknown;
}

// ── Yazma yanıtları (gerçek sandbox yanıtından doğrulandı) ──
// packets/create — yeni paket → yalnız { packetId } (detayı packets.get ile çek).
export interface PacketCreateResult { packetId: string; [extra: string]: unknown }
// packets/update — allowlist alan güncelleme → değişen alanların adları.
export interface PacketUpdateResult { packetId: string; updated: string[]; [extra: string]: unknown }
// packets/update-orders — cart full-replace → yeniden hesaplanan total.
export interface PacketOrdersResult { packetId: string; total: number; [extra: string]: unknown }
// packets/update-payments — payments full-replace → yeniden hesaplanan paid.
export interface PacketPaymentsResult { packetId: string; paid: number; [extra: string]: unknown }
