// OAuth Connect token exchange — tek-kullanımlık code → kalıcı kurulum credential'ı.
// client_secret YALNIZ sunucuda kullanılır; tarayıcıya/iframe'e asla gönderme.
import { OAuthError } from './errors.js';
import { resolveBaseUrl } from './config.js';
import type { Environment } from './config.js';
import type { Scope } from './catalog.js';

export interface InstallCredentials {
  tenantId: string;
  pluginId?: string;
  version?: string;
  /** OAuth token tipi (bilgilendirici; entegrasyon mantığı buna bağlı değildir). */
  tokenType?: string;
  /** Callback API çağrılarında: Authorization: Bearer <apiKey>. */
  apiKey: string;
  /** Webhook + action imza doğrulaması + session token. */
  webhookSecret: string;
  /** Kurulumda gerçekten verilen yetkiler. */
  scopes: Scope[];
}

export interface ExchangeOptions {
  environment?: Environment;
  baseUrl?: string;
  /** Test/SSR için özel fetch. Varsayılan: global fetch. */
  fetchImpl?: typeof fetch;
}

/**
 * Connect dönüşündeki code'u credential'a çevirir.
 * Hata: RFC 6749 (HTTP 4xx + {error, error_description}) → OAuthError fırlatır.
 */
export async function exchangeCode(
  params: { code: string; clientId: string; clientSecret: string },
  options: ExchangeOptions = {},
): Promise<InstallCredentials> {
  const base = resolveBaseUrl(options);
  const doFetch = options.fetchImpl ?? fetch;
  const res = await doFetch(`${base}/plugin-api/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: params.code,
      client_id: params.clientId,
      client_secret: params.clientSecret,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || body.success === false) {
    const message = String(body.error_description ?? body.error ?? body.message ?? `token_exchange_failed_${res.status}`);
    throw new OAuthError(message, typeof body.error === 'string' ? body.error : undefined, res.status);
  }
  // Yanıt sarmalı ({success,data}) veya düz olabilir — ikisine de hazır.
  const d = ((body.data ?? body) as Record<string, unknown>) ?? {};
  return {
    tenantId: String(d.tenantId ?? ''),
    pluginId: typeof d.pluginId === 'string' ? d.pluginId : undefined,
    version: typeof d.version === 'string' ? d.version : undefined,
    tokenType: typeof d.tokenType === 'string' ? d.tokenType : undefined,
    apiKey: String(d.apiKey ?? ''),
    webhookSecret: String(d.webhookSecret ?? ''),
    scopes: Array.isArray(d.scopes) ? (d.scopes as Scope[]) : [],
  };
}
