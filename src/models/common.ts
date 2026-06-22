// Ortak yazma yanıtı — silme uçları `{ id, deleted }` döner
// (products/categories/payment-methods/ingredients delete). Gerçek yanıttan doğrulandı.
export interface DeleteResult {
  id: string;
  deleted: boolean;
  [extra: string]: unknown;
}
