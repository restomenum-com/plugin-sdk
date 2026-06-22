// Ürün kataloğu öğesi — products/list, products/get, products/create|update (hepsi AYNI kanonik şekil).
// Gerçek sandbox yanıtından doğrulandı. cost/recete ASLA dönmez (ticari sır).

export interface ProductChoice {
  id: number;
  title: string;
  price: number;
  [extra: string]: unknown;
}

export interface ProductOption {
  id: number;
  /** Grup başlığı (boş olabilir). */
  title: string;
  min: number;
  max: number;
  /** Çoklu seçim mi. */
  multiple: boolean;
  choices: ProductChoice[];
  [extra: string]: unknown;
}

export interface Product {
  id: string;
  title: string;
  /** Kategori KİMLİĞİ (categories/get ile eşleşir) — ad DEĞİL. */
  category: string;
  price: number;
  /** KDV oranı (%). */
  tax: number;
  active: boolean;
  /** Görsel URL — yeni kayıtta `null` gelir. */
  image: string | null;
  barcode: string;
  barcodeType: string;
  /** Stok (negatif olabilir). cost/recete dönmez. */
  stock: number;
  /** Çoklu dil sözlüğü (boş olabilir). */
  languages: Record<string, { title?: string; description?: string; [k: string]: unknown }>;
  options: ProductOption[];
  /** İleriye dönük (additive) alanlar. */
  [extra: string]: unknown;
}
