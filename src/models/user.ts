// Personel (kullanıcı) — users/get → [{ id, name }]. pincode/yetki/e-posta/mesai DÖNMEZ.
// PII: `name` yalnız users:read + tenant consent ile dolu; aksi halde kırpılır.
export interface User {
  id: string;
  /** PII — consent yoksa undefined/null olabilir. */
  name?: string | null;
  /** İleriye dönük (additive) alanlar. */
  [extra: string]: unknown;
}
