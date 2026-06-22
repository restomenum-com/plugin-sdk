// Event dispatcher — doğrulanmış webhook zarfını tipine göre doğru handler'a yönlendirir.
// Her event'in handler'ı src/events/<kaynak>/<event>.mjs içinde (tek dosya = tek event).
// Tanınmayan event tipi → sessizce yok sayılır (ileri uyum: yeni event tipine 200 dön; webhookRoute halleder).
import { onTableCreated } from './tables/tableCreated.mjs';
import { onTableClosed } from './tables/tableClosed.mjs';
import { onPacketCreated } from './packets/packetCreated.mjs';
import { onPacketClosed } from './packets/packetClosed.mjs';
import { onProductCreated } from './products/productCreated.mjs';
import { onProductUpdated } from './products/productUpdated.mjs';
import { onProductDeleted } from './products/productDeleted.mjs';
import { onCategoryCreated } from './categories/categoryCreated.mjs';
import { onCategoryUpdated } from './categories/categoryUpdated.mjs';
import { onCategoryDeleted } from './categories/categoryDeleted.mjs';
import { onUserCreated } from './users/userCreated.mjs';
import { onUserUpdated } from './users/userUpdated.mjs';
import { onUserDeleted } from './users/userDeleted.mjs';
import { onCustomerCreated } from './customers/customerCreated.mjs';
import { onCustomerUpdated } from './customers/customerUpdated.mjs';
import { onCustomerOrderAdded } from './customers/customerOrderAdded.mjs';
import { onCustomerPaymentAdded } from './customers/customerPaymentAdded.mjs';
import { onPaymentMethodCreated } from './paymentMethods/paymentMethodCreated.mjs';
import { onPaymentMethodUpdated } from './paymentMethods/paymentMethodUpdated.mjs';
import { onPaymentMethodDeleted } from './paymentMethods/paymentMethodDeleted.mjs';
import { onIngredientCreated } from './ingredients/ingredientCreated.mjs';
import { onIngredientUpdated } from './ingredients/ingredientUpdated.mjs';
import { onIngredientDeleted } from './ingredients/ingredientDeleted.mjs';
import { onPurchaseGranted } from './purchases/purchaseGranted.mjs';
// Lifecycle webhook'ları — abonelik/scope GEREKMEZ; bağlı her kuruluma aynı webhookUrl+HMAC ile gelir.
import { onAppInstalled } from './lifecycle/appInstalled.mjs';
import { onAppUninstalled } from './lifecycle/appUninstalled.mjs';
import { onSubscriptionActivated } from './lifecycle/subscriptionActivated.mjs';
import { onSubscriptionPastDue } from './lifecycle/subscriptionPastDue.mjs';
import { onSubscriptionCanceled } from './lifecycle/subscriptionCanceled.mjs';
import { onCustomerRedact } from './lifecycle/customerRedact.mjs';
import { onDeliveryDegraded } from './lifecycle/deliveryDegraded.mjs';
import { onDeliveryRestored } from './lifecycle/deliveryRestored.mjs';
import { onDeliveryDisabled } from './lifecycle/deliveryDisabled.mjs';
import { onDeliveryThrottled } from './lifecycle/deliveryThrottled.mjs';

// event tipi → handler. Anahtarlar katalog EVENT_TYPES ile birebir (manifest events[]'e abone olduklarınla hizala).
const handlers = {
  'table.created': onTableCreated,
  'table.closed': onTableClosed,
  'packet.created': onPacketCreated,
  'packet.closed': onPacketClosed,
  'product.created': onProductCreated,
  'product.updated': onProductUpdated,
  'product.deleted': onProductDeleted,
  'category.created': onCategoryCreated,
  'category.updated': onCategoryUpdated,
  'category.deleted': onCategoryDeleted,
  'user.created': onUserCreated,
  'user.updated': onUserUpdated,
  'user.deleted': onUserDeleted,
  'customer.created': onCustomerCreated,
  'customer.updated': onCustomerUpdated,
  'customer.order_added': onCustomerOrderAdded,
  'customer.payment_added': onCustomerPaymentAdded,
  'payment_method.created': onPaymentMethodCreated,
  'payment_method.updated': onPaymentMethodUpdated,
  'payment_method.deleted': onPaymentMethodDeleted,
  'ingredient.created': onIngredientCreated,
  'ingredient.updated': onIngredientUpdated,
  'ingredient.deleted': onIngredientDeleted,
  'purchase.granted': onPurchaseGranted,
  // Lifecycle (subscribable DEĞİL — manifest events[] gerekmez; bağlı her kuruluma gelir).
  'app.installed': onAppInstalled,
  'app.uninstalled': onAppUninstalled,
  'subscription.activated': onSubscriptionActivated,
  'subscription.past_due': onSubscriptionPastDue,
  'subscription.canceled': onSubscriptionCanceled,
  'customer.redact': onCustomerRedact,
  'delivery.degraded': onDeliveryDegraded,
  'delivery.restored': onDeliveryRestored,
  'delivery.disabled': onDeliveryDisabled,
  'delivery.throttled': onDeliveryThrottled,
};

/** Bu örneğin handler'ı olan event tipleri — manifest'te abone olacağın events[] ile hizala. */
export const HANDLED_EVENTS = Object.keys(handlers);

/**
 * Doğrulanmış event'i tipine göre ilgili handler'a yönlendir.
 * Tanınmayan tip → yok say (ileri uyum). Handler hata fırlatırsa çağıran (webhookRoute) yukarı taşır.
 * @param {{ id:string, type:string, version:string, tenantId:string, occurredAt:number, data:unknown }} envelope
 * @param {{ client?:object, install?:object, log?:(m:string)=>void }} ctx  handler bağlamı (Callback API istemcisi vb.)
 */
export async function dispatchEvent(envelope, ctx = {}) {
  const handler = handlers[envelope.type];
  if (!handler) {
    ctx.log?.(`event: ${envelope.type} (handler yok — yok sayıldı)`);
    return;
  }
  await handler(envelope, ctx);
}
