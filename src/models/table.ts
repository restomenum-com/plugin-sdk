// Masa (dine-in) — tables/get + tables/open + tables/layout.
// ⚠️ packets ile YALNIZ `orders[]` + totaller ortaktır; kimlik/başlık AYRIDIR:
// packetId DEĞİL → tableId/tableName/desing/personCount. (Gerçek sandbox yanıtından doğrulandı.)
import type { OrderLine } from './packet.js';

// tables/get — dolu masa hesabı.
export interface Table {
  /** Masa kimliği (packetId DEĞİL). */
  tableId: string;
  tableName: string;
  docNo?: number;
  /** Bölüm/dizayn adı (kaynakta `desing` yazımıyla gelir). */
  desing?: string;
  location?: string;
  personCount: number;
  orders: OrderLine[];
  total: number;
  paid: number;
  totalDiscount?: number;
  /** Sipariş durumu — bazı durumlarda gelir. */
  status?: string | null;
  /** Kanal sınıfı (ör. "TABLE"). */
  channel?: string;
  [extra: string]: unknown;
}

// tables/open — açık masa ÖZETİ (orders yerine itemCount).
export interface TableSummary {
  tableId: string;
  tableName: string;
  docNo?: number;
  desing?: string;
  personCount: number;
  /** Açık masadaki kalem adedi. */
  itemCount: number;
  total: number;
  paid: number;
  totalDiscount?: number;
  [extra: string]: unknown;
}

// tables/layout — kat planı: bölüm → masalar (yalnız id+ad; ücret/grid dönmez).
export interface FloorPlanTable {
  id: string;
  title: string;
  [extra: string]: unknown;
}
export interface FloorPlanSection {
  id: string;
  title: string;
  tables: FloorPlanTable[];
  [extra: string]: unknown;
}

// ── Yazma yanıtları (gerçek sandbox yanıtından doğrulandı) ──
// tables/update-orders — cart full-replace → yeniden hesaplanan total (kuver dahil).
export interface TableOrdersResult { tableId: string; total: number; [extra: string]: unknown }
// tables/update-payments — payments full-replace → yeniden hesaplanan paid.
export interface TablePaymentsResult { tableId: string; paid: number; [extra: string]: unknown }
