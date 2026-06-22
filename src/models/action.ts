// Senkron aksiyon/hook isteği + yanıt sözleşmesi.

export interface ActionRequest {
  id: string;
  type?: string;
  hook: string;
  tenantId: string;
  slot?: string;
  target: { type?: string; id: string };
  actor: { userId?: string; role?: string };
  /**
   * Form alanları — **yalnız** `type:"form"` butonlarında ve gate (before-hook) formlarında dolu (`ui:form` scope).
   * key → alan değeri; değer tipi alan tipine göre: text/textarea/select/date → string, number → number, checkbox → boolean.
   */
  formData?: Record<string, string | number | boolean>;
  occurredAt?: number;
}

export type ActionLevel = 'info' | 'success' | 'warning' | 'error';
export type ActionDisplay = 'toast' | 'popup';

/** Action ucunun döndüğü kanonik yanıt. `message` düz metindir (HTML değil). */
export interface ActionResponse {
  success: boolean;
  message: string;
  level?: ActionLevel;
  display?: ActionDisplay;
  data?: unknown;
}

/** Action yanıtı üretici (varsayılan display: toast). */
export function actionResponse(
  success: boolean,
  message: string,
  options: { level?: ActionLevel; display?: ActionDisplay; data?: unknown } = {},
): ActionResponse {
  const response: ActionResponse = { success, message, display: options.display ?? 'toast' };
  if (options.level !== undefined) response.level = options.level;
  if (options.data !== undefined) response.data = options.data;
  return response;
}
