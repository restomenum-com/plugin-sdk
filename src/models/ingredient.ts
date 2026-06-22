// Malzeme/stok kartı — ingredients/list + create|update (gerçek yanıttan). ort(maliyet)/stocks/storages dönmez.
export interface Ingredient {
  id: string;
  title: string;
  /** Birim (ör. "kg", "Litre"). */
  unit: string;
  /** Toplam stok. */
  stock: number;
  /** Uyarı eşiği. */
  alert: number;
  /** KDV oranı. */
  tax: number;
  /** İleriye dönük (additive) alanlar. */
  [extra: string]: unknown;
}
