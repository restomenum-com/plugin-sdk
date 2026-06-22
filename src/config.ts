// Restomenum plugin API kökleri + sabitler.

/** Ortam başına Callback/OAuth API kökü. */
export const BASES = {
  sandbox: 'https://sandbox.plugins.restomenum.app',
  production: 'https://plugins.restomenum.app',
} as const;

export type Environment = keyof typeof BASES;

/** Webhook/action imza replay penceresi (saniye) — ±5 dk. */
export const SIGNATURE_TOLERANCE_SEC = 300;

/** Verilen ortam ya da açık baseUrl'den kanonik kökü çözer. */
export function resolveBaseUrl(opts: { environment?: Environment; baseUrl?: string }): string {
  if (opts.baseUrl) return opts.baseUrl.replace(/\/+$/, '');
  return BASES[opts.environment ?? 'sandbox'];
}
