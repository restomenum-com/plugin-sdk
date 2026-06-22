// Ürün kategorisi — categories/list, categories/get, categories/create|update (AYNI şekil; gerçek yanıttan).
// NOT: `color` API yanıtında DÖNER (category.* event payload'ında DÖNMEZ).
export interface Category {
  id: string;
  title: string;
  /** Görsel URL (yoksa null). */
  image: string | null;
  /** Renk (hex, ör. "#3f51b5") — API'de var, event'te yok. */
  color?: string;
  rank: number;
  active: boolean;
  /** Çoklu dil (varsa). */
  languages?: Record<string, unknown>;
  /** İleriye dönük (additive) alanlar. */
  [extra: string]: unknown;
}
