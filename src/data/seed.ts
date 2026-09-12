import type { Product, Settings, Transaction } from "../types";
import { CATALOG, FIRST_ORDER_NO } from "./catalog";
import { taxOn, totalFor } from "../lib/tax";

export const DEFAULT_SETTINGS: Settings = {
  currency: "USD",
  taxMode: "added",
  // A real New York rate, so "added" reads as something a client recognises.
  taxRate: 8.875,
};

interface SeedPlan {
  hour: number;
  minute: number;
  method: "cash" | "card";
  items: [string, number][];
  tipPercent: number;
  discountPercent: number;
}

const PLAN: SeedPlan[] = [
  { hour: 7, minute: 18, method: "card", items: [["BEV-001", 1], ["SNK-001", 2]], tipPercent: 15, discountPercent: 0 },
  { hour: 7, minute: 52, method: "cash", items: [["BEV-003", 2], ["SNK-004", 1]], tipPercent: 0, discountPercent: 0 },
  { hour: 8, minute: 26, method: "card", items: [["PAN-004", 3], ["PAN-002", 1]], tipPercent: 0, discountPercent: 0 },
  { hour: 9, minute: 5, method: "card", items: [["PCR-002", 1], ["HHD-001", 1]], tipPercent: 18, discountPercent: 0 },
  { hour: 9, minute: 47, method: "cash", items: [["PAN-003", 1], ["PAN-001", 2]], tipPercent: 0, discountPercent: 5 },
  { hour: 10, minute: 31, method: "card", items: [["HHD-002", 1], ["HHD-003", 2]], tipPercent: 0, discountPercent: 0 },
  { hour: 11, minute: 14, method: "card", items: [["BEV-001", 2], ["SNK-003", 1], ["BEV-004", 1]], tipPercent: 20, discountPercent: 0 },
  { hour: 12, minute: 3, method: "cash", items: [["SNK-001", 1], ["BEV-002", 2]], tipPercent: 0, discountPercent: 0 },
  { hour: 12, minute: 38, method: "card", items: [["PAN-002", 1], ["PAN-001", 1], ["BEV-003", 3]], tipPercent: 15, discountPercent: 0 },
  { hour: 13, minute: 22, method: "card", items: [["PCR-003", 1], ["PCR-002", 2]], tipPercent: 0, discountPercent: 0 },
  { hour: 14, minute: 56, method: "cash", items: [["PAN-004", 2], ["SNK-004", 1]], tipPercent: 0, discountPercent: 0 },
  { hour: 15, minute: 40, method: "card", items: [["BEV-004", 2], ["BEV-001", 1]], tipPercent: 18, discountPercent: 10 },
  { hour: 16, minute: 19, method: "card", items: [["PAN-003", 2], ["HHD-003", 1], ["BEV-003", 2]], tipPercent: 0, discountPercent: 0 },
  { hour: 17, minute: 8, method: "cash", items: [["SNK-003", 2], ["BEV-003", 3]], tipPercent: 0, discountPercent: 0 },
  { hour: 18, minute: 44, method: "card", items: [["PAN-001", 3], ["PAN-002", 1], ["PCR-001", 1]], tipPercent: 15, discountPercent: 0 },
];

export function seedProducts(): Product[] {
  return CATALOG.map((p) => ({ ...p }));
}

function at(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * A plausible trading day so the Sales view has something to show on a first
 * visit. Amounts are computed with the default settings and then frozen on
 * each transaction — changing a store setting must not rewrite history.
 */
export function seedTransactions(settings: Settings): Transaction[] {
  const priceOf = new Map(CATALOG.map((p) => [p.sku, p]));
  let no = FIRST_ORDER_NO;

  return PLAN.map((plan) => {
    const lines = plan.items.map(([sku, qty]) => {
      const product = priceOf.get(sku);
      if (product === undefined) {
        throw new Error("Seed plan references an unknown SKU: " + sku);
      }
      return { sku, name: product.name, unit: product.price, qty };
    });

    const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
    const discount =
      plan.discountPercent === 0
        ? 0
        : Math.round((subtotal * plan.discountPercent) / 100);
    const net = subtotal - discount;
    const tax = taxOn(net, settings.taxMode, settings.taxRate);
    const total = totalFor(net, settings.taxMode, settings.taxRate);
    const tip =
      plan.method === "card" && plan.tipPercent > 0
        ? Math.round((total * plan.tipPercent) / 100)
        : 0;

    no += 1;
    return {
      no,
      at: at(plan.hour, plan.minute),
      method: plan.method,
      lines,
      subtotal,
      discount,
      tax,
      total,
      tip,
      charged: total + tip,
      // Cash drawers get round notes; round up to the next 5 units.
      tender: plan.method === "cash" ? Math.ceil(total / 500) * 500 : 0,
      cardBrand: plan.method === "card" ? "VISA" : "",
      cardLast4: plan.method === "card" ? "4242" : "",
      currency: settings.currency,
      taxMode: settings.taxMode,
      taxRate: settings.taxRate,
    };
  });
}

/** The next order number after the seeded day. */
export function seedNextOrderNo(): number {
  return FIRST_ORDER_NO + PLAN.length + 1;
}
