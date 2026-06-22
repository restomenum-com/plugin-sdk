// Webhook alıcı yardımcıları — framework-agnostik doğrulama + Express/Connect middleware.
import { verifyWebhookSignature } from '../signature.js';
import type { VerifyOptions } from '../signature.js';
import { parseEnvelope } from '../models/envelope.js';
import type { WebhookEnvelope } from '../models/envelope.js';

export interface WebhookVerifyOptions extends VerifyOptions {
  /** tenantId → o kurulumun webhookSecret'i (senkron veya async; DB'den). */
  getSecret: (tenantId: string) => string | undefined | Promise<string | undefined>;
}

/**
 * Framework-agnostik: ham gövde + imza header + tenant secret → doğrulanmış envelope, ya da null.
 * null → imza/şekil geçersiz → çağıran 401 dönmeli. ham gövde DEĞİŞTİRİLMEMİŞ olmalı (imza ham bayt üzerinden).
 */
export async function verifyAndParseWebhook<T = unknown>(
  rawBody: string,
  signatureHeader: string | string[] | undefined,
  options: WebhookVerifyOptions,
): Promise<WebhookEnvelope<T> | null> {
  let envelope: WebhookEnvelope<T>;
  try {
    envelope = parseEnvelope<T>(rawBody);
  } catch {
    return null;
  }
  const secret = await options.getSecret(envelope.tenantId);
  if (!secret) return null;
  if (!verifyWebhookSignature(rawBody, signatureHeader, secret, options)) return null;
  return envelope;
}

// Minimal Express/Connect req/res arayüzleri (express bağımlılığı GETİRMEZ).
interface MinimalReq {
  headers: Record<string, string | string[] | undefined>;
  rawBody?: string | Buffer;
  body?: unknown;
}
interface MinimalRes {
  headersSent: boolean;
  status(code: number): MinimalRes;
  json(body: unknown): void;
}

/**
 * Express middleware üretir. Ham gövdeyi `req.rawBody` (string/Buffer) ya da Buffer `req.body`'den okur
 * (express.raw veya verify ile ham gövdeyi sakladığından emin ol — imza ham bayt ister).
 * İmza geçersizse 401; geçerliyse handler çağrılır, handler yanıt yazmadıysa 200 { ok:true }.
 */
export function expressWebhook<T = unknown>(
  options: WebhookVerifyOptions,
  handler: (envelope: WebhookEnvelope<T>, req: MinimalReq, res: MinimalRes) => void | Promise<void>,
): (req: MinimalReq, res: MinimalRes) => Promise<void> {
  return async (req, res) => {
    const raw =
      typeof req.rawBody === 'string' ? req.rawBody
      : Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf8')
      : Buffer.isBuffer(req.body) ? req.body.toString('utf8')
      : '';
    const envelope = await verifyAndParseWebhook<T>(raw, req.headers['x-restomenum-signature'], options);
    if (!envelope) {
      res.status(401).json({ error: 'invalid_signature' });
      return;
    }
    await handler(envelope, req, res);
    if (!res.headersSent) res.status(200).json({ ok: true });
  };
}
