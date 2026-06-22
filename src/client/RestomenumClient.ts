// Callback API istemcisi — install apiKey ile Restomenum'dan veri okur/yazar.
// REST hata kodlarını (404/400/403/409) ApiError'a çevirir; 429'da Retry-After taşır.
// Etkileşimler (event/action) yalnız id taşır → dolu veriyi bu istemciyle çek.
// Dönüş tipleri GERÇEK sandbox yanıtlarından modellenmiştir (§18.3).
import { ApiError } from '../errors.js';
import { resolveBaseUrl } from '../config.js';
import type { Environment } from '../config.js';
import type { Customer, CustomerPage } from '../models/customer.js';
import type { Packet, PacketSummary, PacketCreateResult, PacketUpdateResult, PacketOrdersResult, PacketPaymentsResult } from '../models/packet.js';
import type { Table, TableSummary, FloorPlanSection, TableOrdersResult, TablePaymentsResult } from '../models/table.js';
import type { Product } from '../models/product.js';
import type { Category } from '../models/category.js';
import type { PaymentMethod } from '../models/paymentMethod.js';
import type { Ingredient } from '../models/ingredient.js';
import type { User } from '../models/user.js';
import type { Purchase, CreatePurchaseInput, CreatePurchaseResult } from '../models/purchase.js';
import type { DeleteResult } from '../models/common.js';

export interface ClientOptions {
  apiKey: string;
  environment?: Environment;
  baseUrl?: string;
  /** Test/SSR için özel fetch. Varsayılan: global fetch. */
  fetchImpl?: typeof fetch;
}

export interface ListResult<T> {
  data: T[];
  truncated?: boolean;
  total?: number;
}

export class RestomenumClient {
  readonly #base: string;
  readonly #apiKey: string;
  readonly #fetch: typeof fetch;

  constructor(options: ClientOptions) {
    this.#base = resolveBaseUrl(options);
    this.#apiKey = options.apiKey;
    this.#fetch = options.fetchImpl ?? fetch;
  }

  // ── Düşük seviye istek (tüm gövdeyi parse eder, hata kodlarını ApiError'a çevirir) ──
  async #requestEnvelope(method: string, path: string, body?: unknown): Promise<Record<string, unknown>> {
    const headers: Record<string, string> = { Authorization: `Bearer ${this.#apiKey}` };
    if (body !== undefined) headers['content-type'] = 'application/json';
    const res = await this.#fetch(`${this.#base}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after'));
      throw new ApiError('plugin.rateLimited', 429, 'plugin.rateLimited', Number.isFinite(retryAfter) ? retryAfter : undefined);
    }
    if (!res.ok || json.success === false) {
      const code = typeof json.message === 'string' ? json.message : undefined;
      throw new ApiError(code ?? `http_${res.status}`, res.status, code);
    }
    return json;
  }

  #get<T>(path: string): Promise<T> {
    return this.#requestEnvelope('GET', path).then((j) => j.data as T);
  }
  #post<T>(path: string, body: unknown): Promise<T> {
    return this.#requestEnvelope('POST', path, body).then((j) => j.data as T);
  }

  // ── Paketler (delivery) ──
  readonly packets = {
    /** Açık paket ÖZETLERİ (itemCount; orders/customer yok). */
    open: (): Promise<PacketSummary[]> => this.#get('/plugin-api/packets/open'),
    /** Dolu paket (orders + PII-gated customer). */
    get: (packetId: string): Promise<Packet> => this.#get(`/plugin-api/packets/get?packetId=${encodeURIComponent(packetId)}`),
    /** Yeni paket → { packetId } (detayı get ile çek). */
    create: (body: unknown): Promise<PacketCreateResult> => this.#post('/plugin-api/packets/create', body),
    /** Allowlist alan güncelle → { packetId, updated[] }. */
    update: (body: unknown): Promise<PacketUpdateResult> => this.#post('/plugin-api/packets/update', body),
    /** Cart full-replace → { packetId, total }. */
    updateOrders: (body: unknown): Promise<PacketOrdersResult> => this.#post('/plugin-api/packets/update-orders', body),
    /** Payments full-replace → { packetId, paid }. */
    updatePayments: (body: unknown): Promise<PacketPaymentsResult> => this.#post('/plugin-api/packets/update-payments', body),
  };

  // ── Masalar (dine-in) — kimlik AYRI: tableId/tableName (packetId DEĞİL). open=özet · get=dolu · layout=kat planı ──
  readonly tables = {
    /** Açık masa ÖZETLERİ (itemCount; orders yok). */
    open: (): Promise<TableSummary[]> => this.#get('/plugin-api/tables/open'),
    /** Dolu masa hesabı (orders + totaller). */
    get: (id: string): Promise<Table> => this.#get(`/plugin-api/tables/get?id=${encodeURIComponent(id)}`),
    /** Kat planı: bölümler → masalar (id+ad). */
    layout: (): Promise<FloorPlanSection[]> => this.#get('/plugin-api/tables/layout'),
    /** Açık masa cart full-replace → { tableId, total }. */
    updateOrders: (body: unknown): Promise<TableOrdersResult> => this.#post('/plugin-api/tables/update-orders', body),
    /** Açık masa payments full-replace → { tableId, paid }. */
    updatePayments: (body: unknown): Promise<TablePaymentsResult> => this.#post('/plugin-api/tables/update-payments', body),
  };

  // ── Ürünler ──
  readonly products = {
    list: (): Promise<ListResult<Product>> => this.#requestEnvelope('GET', '/plugin-api/products/list').then((j) => ({ data: (j.data ?? []) as Product[], truncated: j.truncated as boolean | undefined, total: j.total as number | undefined })),
    get: (id: string): Promise<Product> => this.#get(`/plugin-api/products/get?id=${encodeURIComponent(id)}`),
    create: (body: unknown): Promise<Product> => this.#post('/plugin-api/products/create', body),
    update: (body: unknown): Promise<Product> => this.#post('/plugin-api/products/update', body),
    delete: (body: unknown): Promise<DeleteResult> => this.#post('/plugin-api/products/delete', body),
  };

  // ── Kategoriler ──
  readonly categories = {
    list: (): Promise<Category[]> => this.#get('/plugin-api/categories/list'),
    get: (id: string): Promise<Category> => this.#get(`/plugin-api/categories/get?id=${encodeURIComponent(id)}`),
    create: (body: unknown): Promise<Category> => this.#post('/plugin-api/categories/create', body),
    update: (body: unknown): Promise<Category> => this.#post('/plugin-api/categories/update', body),
    delete: (body: unknown): Promise<DeleteResult> => this.#post('/plugin-api/categories/delete', body),
  };

  // ── Ödeme yöntemleri ──
  readonly paymentMethods = {
    list: (): Promise<PaymentMethod[]> => this.#get('/plugin-api/payment-methods/list'),
    create: (body: unknown): Promise<PaymentMethod> => this.#post('/plugin-api/payment-methods/create', body),
    update: (body: unknown): Promise<PaymentMethod> => this.#post('/plugin-api/payment-methods/update', body),
    delete: (body: unknown): Promise<DeleteResult> => this.#post('/plugin-api/payment-methods/delete', body),
  };

  // ── Malzemeler ──
  readonly ingredients = {
    list: (): Promise<Ingredient[]> => this.#get('/plugin-api/ingredients/list'),
    create: (body: unknown): Promise<Ingredient> => this.#post('/plugin-api/ingredients/create', body),
    update: (body: unknown): Promise<Ingredient> => this.#post('/plugin-api/ingredients/update', body),
    delete: (body: unknown): Promise<DeleteResult> => this.#post('/plugin-api/ingredients/delete', body),
  };

  // ── Personel ──
  readonly users = {
    /** Personel listesi [{ id, name?(PII) }]. */
    get: (): Promise<User[]> => this.#get('/plugin-api/users/get'),
  };

  // ── Müşteriler (CRM) — cursor pagination ──
  readonly customers = {
    get: (customerId: string): Promise<Customer> => this.#get(`/plugin-api/customers/get?customerId=${encodeURIComponent(customerId)}`),
    list: (params: { limit?: number; after?: string } = {}): Promise<CustomerPage> => {
      const q = new URLSearchParams();
      if (params.limit !== undefined) q.set('limit', String(params.limit));
      if (params.after !== undefined) q.set('after', params.after);
      const qs = q.toString();
      return this.#requestEnvelope('GET', `/plugin-api/customers/list${qs ? `?${qs}` : ''}`).then((j) => ({
        data: (j.data ?? []) as Customer[],
        nextCursor: (j.nextCursor ?? null) as string | null,
        hasMore: j.hasMore === true,
      }));
    },
    /** Tüm müşterileri cursor ile gez (offset yok). Arrow → instance `this`'i yakalar. */
    listAll: (pageSize = 200): AsyncGenerator<Customer> => {
      const client = this; // arrow: instance
      async function* iterate(): AsyncGenerator<Customer> {
        let after: string | undefined;
        for (;;) {
          const page: CustomerPage = await client.customers.list({ limit: pageSize, ...(after ? { after } : {}) });
          for (const customer of page.data) yield customer;
          if (!page.hasMore || !page.nextCursor) break;
          after = page.nextCursor;
        }
      }
      return iterate();
    },
  };

  // ── Satın almalar (IAP — tek-seferlik uygulama-içi satın alma) ──
  readonly purchases = {
    /** Checkout başlat → { url, sessionId, purchaseId }. Tenant'ı `url`'e yönlendir; durumu get/list ile izle. */
    create: (input: CreatePurchaseInput): Promise<CreatePurchaseResult> => this.#post('/plugin-api/purchases/create', input),
    /** Tek satın almanın authoritative durumu (status/zaman damgaları). */
    get: (purchaseId: string): Promise<Purchase> => this.#get(`/plugin-api/purchases/get?purchaseId=${encodeURIComponent(purchaseId)}`),
    /** Yalnız çağıran install'ın satın almaları — en yeni önce (limit max 100). */
    list: (params: { limit?: number } = {}): Promise<Purchase[]> => {
      const qs = params.limit !== undefined ? `?limit=${params.limit}` : '';
      return this.#get(`/plugin-api/purchases/list${qs}`);
    },
  };
}
