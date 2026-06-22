// Ödeme yöntemi tanımı — payment-methods/list + create|update (gerçek yanıttan). users dönmez.
export interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  /** Nakit mi (kasa davranışı). */
  cash: boolean;
  /** Rapora yansımasın. */
  noreport: boolean;
  /** İleriye dönük (additive) alanlar. */
  [extra: string]: unknown;
}
