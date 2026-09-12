import type { CategoryName, Transaction } from "../types";

export interface SalesSummary {
  count: number;
  units: number;
  gross: number;
  tax: number;
  netOfTax: number;
  tips: number;
  discounts: number;
  average: number;
  cash: number;
  card: number;
}

export function summarize(txs: Transaction[]): SalesSummary {
  const gross = txs.reduce((s, t) => s + t.total, 0);
  const tax = txs.reduce((s, t) => s + t.tax, 0);
  const count = txs.length;
  return {
    count,
    units: txs.reduce(
      (s, t) => s + t.lines.reduce((u, l) => u + l.qty, 0),
      0,
    ),
    gross,
    tax,
    netOfTax: gross - tax,
    tips: txs.reduce((s, t) => s + t.tip, 0),
    discounts: txs.reduce((s, t) => s + t.discount, 0),
    average: count === 0 ? 0 : Math.round(gross / count),
    cash: txs.filter((t) => t.method === "cash").reduce((s, t) => s + t.charged, 0),
    card: txs.filter((t) => t.method === "card").reduce((s, t) => s + t.charged, 0),
  };
}

export interface HourBucket {
  hour: number;
  amount: number;
}

export const OPEN_HOUR = 7;
export const CLOSE_HOUR = 20;

/** Trading-hour buckets. Sales outside the window fold into the edges so no
 *  money ever disappears from the chart. */
export function byHour(txs: Transaction[]): HourBucket[] {
  const buckets: HourBucket[] = [];
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h++) buckets.push({ hour: h, amount: 0 });
  for (const t of txs) {
    const hour = new Date(t.at).getHours();
    const index = Math.min(
      Math.max(hour, OPEN_HOUR) - OPEN_HOUR,
      CLOSE_HOUR - OPEN_HOUR,
    );
    const bucket = buckets[index];
    if (bucket !== undefined) bucket.amount += t.total;
  }
  return buckets;
}

export interface RankedRow {
  key: string;
  label: string;
  amount: number;
  sub: string;
  color?: string;
}

export interface ProductRow {
  sku: string;
  name: string;
  category: CategoryName | "Other";
  qty: number;
  amount: number;
}

export function topProducts(txs: Transaction[], limit: number): ProductRow[] {
  const map = new Map<string, ProductRow>();
  for (const t of txs) {
    for (const line of t.lines) {
      const current = map.get(line.sku);
      if (current === undefined) {
        map.set(line.sku, {
          sku: line.sku,
          name: line.name,
          category: categoryFromSku(line.sku),
          qty: line.qty,
          amount: line.unit * line.qty,
        });
      } else {
        current.qty += line.qty;
        current.amount += line.unit * line.qty;
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export interface TaxRow {
  category: CategoryName | "Other";
  net: number;
  tax: number;
}

/**
 * Tax recorded per transaction is apportioned across its lines by value, so
 * the category split always adds back up to the tax actually collected.
 */
export function taxByCategory(txs: Transaction[]): TaxRow[] {
  const map = new Map<string, TaxRow>();
  for (const t of txs) {
    const lineSum = t.lines.reduce((s, l) => s + l.unit * l.qty, 0);
    if (lineSum === 0) continue;
    const netOfTax = t.total - t.tax;
    for (const line of t.lines) {
      const category = categoryFromSku(line.sku);
      const share = (line.unit * line.qty) / lineSum;
      const row = map.get(category);
      if (row === undefined) {
        map.set(category, {
          category,
          net: netOfTax * share,
          tax: t.tax * share,
        });
      } else {
        row.net += netOfTax * share;
        row.tax += t.tax * share;
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.tax - a.tax);
}

/** SKU prefixes are the catalogue's category key, so no lookup is needed. */
export function categoryFromSku(sku: string): CategoryName | "Other" {
  switch (sku.slice(0, 3)) {
    case "BEV": return "Beverages";
    case "SNK": return "Snacks";
    case "PAN": return "Pantry";
    case "HHD": return "Household";
    case "PCR": return "Personal care";
    default: return "Other";
  }
}
