// Webhook + action imza doğrulama (HMAC-SHA256). Restomenum webhook ve senkron action AYNI şemayı kullanır.
// X-Restomenum-Signature: t=<unixSec>,v1=HMAC_SHA256(webhookSecret, "<t>.<rawBody>")
// HAM gövde üzerinde doğrula (JSON.parse edilmiş değil), ±tolerans replay penceresi, timing-safe.
import crypto from 'node:crypto';
import { SIGNATURE_TOLERANCE_SEC } from './config.js';

export interface VerifyOptions {
  /** Replay penceresi (saniye). Varsayılan 300 (±5 dk). */
  toleranceSec?: number;
}

/**
 * İmzayı doğrula. Geçersiz/eksik/bayat ise false döner (çağıran 401 döner).
 * `signatureHeader` Node'da tekrarlanan header'da DİZİ olabilir → string değilse reddedilir.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | string[] | undefined,
  secret: string,
  options: VerifyOptions = {},
): boolean {
  if (typeof signatureHeader !== 'string' || !secret) return false;
  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) return false;
  const tolerance = options.toleranceSec ?? SIGNATURE_TOLERANCE_SEC;
  if (Math.abs(Date.now() / 1000 - parsed.t) > tolerance) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${parsed.t}.${rawBody}`).digest('hex');
  return timingSafeEqualHex(expected, parsed.v1);
}

/** Test/geliştirme için imza üret (sender tarafını taklit eder). */
export function signPayload(rawBody: string, secret: string, timestampSec?: number): string {
  const t = timestampSec ?? Math.floor(Date.now() / 1000);
  const v1 = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  return `t=${t},v1=${v1}`;
}

/** "t=...,v1=..." → { t, v1 }. Değerdeki '=' korunur (ilk '='den böl). */
function parseSignatureHeader(header: string): { t: number; v1: string } | null {
  const map = new Map<string, string>();
  for (const segment of header.split(',')) {
    const i = segment.indexOf('=');
    if (i < 0) continue;
    map.set(segment.slice(0, i).trim(), segment.slice(i + 1).trim());
  }
  const t = Number(map.get('t'));
  const v1 = map.get('v1');
  if (!t || !v1) return null;
  return { t, v1 };
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}
