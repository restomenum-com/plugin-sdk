// Webhook/lifecycle teslim zarfı — yalnız `data` event'e özeldir.
export interface WebhookEnvelope<T = unknown> {
  /** Idempotency anahtarı (retry'da sabit). */
  id: string;
  /** Event tipi (örn. "table.created"). */
  type: string;
  /** Zarf şema sürümü (string, örn. "1"). */
  version: string;
  /** Restoran (tenant) kimliği. */
  tenantId: string;
  /** Oluşma zamanı — epoch MİLİSANİYE (imza t= ise saniye). */
  occurredAt: number;
  /** Event'e özgü gövde. */
  data: T;
}

/**
 * Ham gövdeyi doğrula + zarfa çevir. Geçersizse Error fırlatır (sınırda yakala).
 * NOT: İmza doğrulaması AYRI yapılır (verifyWebhookSignature) — bu yalnız şekil doğrular.
 */
export function parseEnvelope<T = unknown>(rawBody: string): WebhookEnvelope<T> {
  let obj: unknown;
  try {
    obj = JSON.parse(rawBody);
  } catch {
    throw new Error('invalid_json');
  }
  if (!obj || typeof obj !== 'object') throw new Error('invalid_envelope');
  const e = obj as Record<string, unknown>;
  if (typeof e.id !== 'string') throw new Error('missing_id');
  if (typeof e.tenantId !== 'string') throw new Error('missing_tenantId');
  return {
    id: e.id,
    type: typeof e.type === 'string' ? e.type : '',
    version: typeof e.version === 'string' ? e.version : '1',
    tenantId: e.tenantId,
    occurredAt: typeof e.occurredAt === 'number' ? e.occurredAt : 0,
    data: (e.data ?? {}) as T,
  };
}
