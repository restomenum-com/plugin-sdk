// Event + scope katalogu — sabitler ve tipler. Restomenum domain kataloğunun aynası (tek-kaynak).
// Yeni event/scope yayınlanınca burayı güncelle (portal lib/catalog.ts ile hizalı tut).

export const EVENT_TYPES = [
  'table.created',
  'table.closed',
  'packet.created',
  'packet.closed',
  'product.created',
  'product.updated',
  'product.deleted',
  'category.created',
  'category.updated',
  'category.deleted',
  'user.created',
  'user.updated',
  'user.deleted',
  'customer.created',
  'customer.updated',
  'customer.order_added',
  'customer.payment_added',
  'payment_method.created',
  'payment_method.updated',
  'payment_method.deleted',
  'ingredient.created',
  'ingredient.updated',
  'ingredient.deleted',
  'purchase.granted',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const SCOPES = [
  'orders:read',
  'orders:write',
  'products:read',
  'products:write',
  'packets:status',
  'payment_methods:read',
  'payment_methods:write',
  'ingredients:read',
  'ingredients:write',
  'customers:read',
  'users:read',
  'purchases:read',
  'purchases:write',
  'events:subscribe',
  'ui:button',
  'ui:form',
  'ui:widget',
  'ui:nav',
  'ui:page',
] as const;
export type Scope = (typeof SCOPES)[number];

/** PII scope'ları — kurulumda açık dataConsent gerektirir. */
export const PII_SCOPES: readonly Scope[] = ['customers:read', 'users:read'];

/** Lifecycle webhook tipleri — abonelik GEREKMEZ; bağlı her kuruluma gönderilir. */
export const LIFECYCLE_TYPES = [
  'app.installed',
  'app.uninstalled',
  'subscription.activated',
  'subscription.past_due',
  'subscription.canceled',
  'customer.redact',
  'delivery.degraded',
  'delivery.restored',
  'delivery.disabled',
  'delivery.throttled',
] as const;
export type LifecycleType = (typeof LIFECYCLE_TYPES)[number];

export function isEventType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}
export function isPiiScope(scope: string): boolean {
  return (PII_SCOPES as readonly string[]).includes(scope);
}
