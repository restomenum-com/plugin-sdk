// IAP (tek-seferlik uygulama-içi satın alma) modelleri — purchases/create, get, list.
// Şekiller GERÇEK sandbox yanıtlarından modellenmiştir (§18.3). Tutarlar kuruş (integer);
// currency tenant'a göre (ISO 4217 küçük harf). Stripe/finansal alanlar (net, developerShare,
// sessionId hariç Stripe id'leri) bu yüzeyden SIZMAZ — yalnız aşağıdaki allowlist döner.

/** Satın alma yaşam döngüsü — zaman damgalarıyla örtüşür (paidAt → grantedAt; refundedAt). */
export type PurchaseStatus = 'pending' | 'paid' | 'granted' | 'refunded';

/** Satın alma türü — şimdilik yalnız tek-seferlik. */
export type PurchaseType = 'one_time';

/** purchases/get ve purchases/list öğesi — durumun authoritative kaydı. */
export interface Purchase {
  /** Satın alma id'si — her zaman gelir. */
  purchaseId: string;
  /** Yaşam döngüsü durumu (zaman damgalarıyla tutarlı). */
  status: PurchaseStatus;
  /** Satın alma türü. */
  type: PurchaseType;
  /** Eklentinin tanımladığı ürün anahtarı (ör. "premium_unlock"). */
  productKey: string;
  /** Brüt tutar — kuruş (integer). */
  amount: number;
  /** Para birimi — ISO 4217 küçük harf, tenant'a göre (ör. "try"). */
  currency: string;
  /** Oluşturulma — epoch ms. */
  createdAt: number;
  /** Ödeme tamamlandı — epoch ms; ödenene dek null. */
  paidAt: number | null;
  /** Erişim verildi (purchase.granted) — epoch ms; verilene dek null. */
  grantedAt: number | null;
  /** İade edildi — epoch ms; iade yoksa null. */
  refundedAt: number | null;
}

/** purchases/create girdisi — checkout başlatır. idempotencyKey ile retry-güvenli. */
export interface CreatePurchaseInput {
  /** Brüt tutar — kuruş (integer), uç [min,max] aralığını uygular. */
  amount: number;
  /** Eklentinin ürün anahtarı; purchase.granted ve get/list'te geri döner. */
  productKey: string;
  /** Opsiyonel açıklama. */
  description?: string;
  /** Retry-güvenli tekrar için idempotency anahtarı (aynı anahtar = aynı satın alma). */
  idempotencyKey?: string;
}

/** purchases/create yanıtı — tenant'ı Stripe Checkout'a yönlendirmek için. */
export interface CreatePurchaseResult {
  /** Stripe Checkout URL'i — tenant UI bu adrese yönlendirilir (ödeme burada yapılır). */
  url: string;
  /** Stripe Checkout session id'si. */
  sessionId: string;
  /** Oluşturulan satın almanın id'si — durumu get/list ile izlenir. */
  purchaseId: string;
}
