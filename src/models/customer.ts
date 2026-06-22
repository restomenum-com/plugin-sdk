// Müşteri (CRM/cari) allowlist şekli — customers/get, customers/list ve customer.* event'lerinin data.customer'ında aynı.
// Canlı yakalanan şekil (§18.3): { id, name, phone, address, total }. PII (name/phone/address) yalnız customers:read +
// consent ile dolu. Tutarlar ONDALIK TL'dir (integer kuruş DEĞİL — ör. total 22.61).
export interface Customer {
  /** Müşteri ID'si — her zaman gelir. */
  id: string;
  /** Bölge/şube etiketi — PII değil; OPSİYONEL: müşteride tanımlıysa gelir, aksi halde alan hiç gelmez (canlı örneklerde yoktu). */
  region?: string | null;
  /** PII — yalnız consent ile. */
  name?: string | null;
  /** PII — yalnız consent ile. */
  phone?: string | null;
  /** PII — yalnız consent ile. */
  address?: string | null;
  /** Ömür boyu toplam harcama — ONDALIK TL (finansal; ör. 22.61). consent yoksa PII ile birlikte düşebilir. */
  total?: number;
}

/** customers/list cursor sayfası (keyset pagination — offset yok). */
export interface CustomerPage {
  data: Customer[];
  /** Bir sonraki ?after= değeri; son sayfada null. */
  nextCursor: string | null;
  /** Daha fazla sayfa var mı. */
  hasMore: boolean;
}
