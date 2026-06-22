// SDK hata sınıfları — çağıran tek bir hiyerarşiyle yakalayabilir (instanceof RestomenumError).

export class RestomenumError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RestomenumError';
  }
}

/** Webhook/action imza doğrulaması başarısız. */
export class SignatureError extends RestomenumError {
  constructor(message = 'invalid_signature') {
    super(message);
    this.name = 'SignatureError';
  }
}

/** iframe Custom UI App Bridge session token doğrulaması başarısız. */
export class SessionError extends RestomenumError {
  /** Makine-okur başarısızlık nedeni. */
  readonly reason:
    | 'malformed'
    | 'wrong_algorithm'
    | 'invalid_issuer'
    | 'audience_mismatch'
    | 'invalid_signature'
    | 'expired'
    | 'not_yet_valid';
  constructor(reason: SessionError['reason'], message?: string) {
    super(message ?? reason);
    this.name = 'SessionError';
    this.reason = reason;
  }
}

/** OAuth token exchange hatası (RFC 6749: error + error_description). */
export class OAuthError extends RestomenumError {
  readonly code: string | undefined;
  readonly status: number | undefined;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'OAuthError';
    this.code = code;
    this.status = status;
  }
}

/** Callback API hatası — REST HTTP status + makine-okur `message` kodu. */
export class ApiError extends RestomenumError {
  readonly status: number;
  readonly code: string | undefined;
  readonly retryAfterSec: number | undefined;
  constructor(message: string, status: number, code?: string, retryAfterSec?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryAfterSec = retryAfterSec;
  }
}
