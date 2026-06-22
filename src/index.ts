// @restomenum/plugin-sdk — public API.
export { BASES, SIGNATURE_TOLERANCE_SEC, resolveBaseUrl } from './config.js';
export type { Environment } from './config.js';

export {
  EVENT_TYPES,
  SCOPES,
  PII_SCOPES,
  LIFECYCLE_TYPES,
  isEventType,
  isPiiScope,
} from './catalog.js';
export type { EventType, Scope, LifecycleType } from './catalog.js';

export { RestomenumError, SignatureError, SessionError, OAuthError, ApiError } from './errors.js';

export { verifyWebhookSignature, signPayload } from './signature.js';
export type { VerifyOptions } from './signature.js';

export { verifySessionToken } from './sessionToken.js';
export type { SessionTokenClaims, VerifySessionOptions } from './sessionToken.js';

export { exchangeCode } from './oauth.js';
export type { InstallCredentials, ExchangeOptions } from './oauth.js';

export { RestomenumClient } from './client/RestomenumClient.js';
export type { ClientOptions, ListResult } from './client/RestomenumClient.js';

export { verifyAndParseWebhook, expressWebhook } from './webhook/handler.js';
export type { WebhookVerifyOptions } from './webhook/handler.js';

export { parseEnvelope } from './models/envelope.js';
export type { WebhookEnvelope } from './models/envelope.js';
export type { Customer, CustomerPage } from './models/customer.js';
export type { OrderLine, Packet, PacketCustomer, PacketSummary, PacketCreateResult, PacketUpdateResult, PacketOrdersResult, PacketPaymentsResult } from './models/packet.js';
export type { Table, TableSummary, FloorPlanTable, FloorPlanSection, TableOrdersResult, TablePaymentsResult } from './models/table.js';
export type { Product, ProductOption, ProductChoice } from './models/product.js';
export type { Category } from './models/category.js';
export type { PaymentMethod } from './models/paymentMethod.js';
export type { Ingredient } from './models/ingredient.js';
export type { User } from './models/user.js';
export type { Purchase, PurchaseStatus, PurchaseType, CreatePurchaseInput, CreatePurchaseResult } from './models/purchase.js';
export type { DeleteResult } from './models/common.js';
export { actionResponse } from './models/action.js';
export type { ActionRequest, ActionResponse, ActionLevel, ActionDisplay } from './models/action.js';
