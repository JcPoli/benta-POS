import type { OrderLine, Product, Settings } from "../types";
import { taxOn, totalFor } from "./tax";

export interface OrderTotals {
  subtotal: number;
  discount: number;
  net: number;
  tax: number;
  total: number;
  units: number;
}

export function subtotalOf(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
}

export function unitsOf(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

/** Discount can never exceed the subtotal, and tax follows the store mode. */
export function totalsOf(
  lines: OrderLine[],
  discount: number,
  settings: Settings,
): OrderTotals {
  const subtotal = subtotalOf(lines);
  const applied = Math.min(Math.max(0, discount), subtotal);
  const net = subtotal - applied;
  return {
    subtotal,
    discount: applied,
    net,
    tax: taxOn(net, settings.taxMode, settings.taxRate),
    total: totalFor(net, settings.taxMode, settings.taxRate),
    units: unitsOf(lines),
  };
}

/** Quantity of a SKU already on the order. */
export function qtyOf(lines: OrderLine[], sku: string): number {
  const line = lines.find((l) => l.sku === sku);
  return line === undefined ? 0 : line.qty;
}

/** Stock left on the shelf once the open order is accounted for. */
export function availableOf(product: Product, lines: OrderLine[]): number {
  return product.stock - qtyOf(lines, product.sku);
}

/**
 * Why `addLine` would refuse this product, or null when it can be added.
 * `addLine` returns the same array when it refuses, which is deliberate but
 * invisible — this lets the caller say why before the register goes quiet.
 * It must mirror the guards in `addLine` exactly.
 */
export type AddRefusal = "sold-out" | "all-on-order";

export function refusalFor(product: Product, lines: OrderLine[]): AddRefusal | null {
  if (product.stock < 1) return "sold-out";
  if (qtyOf(lines, product.sku) >= product.stock) return "all-on-order";
  return null;
}

/** Adding never exceeds stock; a new SKU lands at the end of the order. */
export function addLine(lines: OrderLine[], product: Product): OrderLine[] {
  const existing = lines.find((l) => l.sku === product.sku);
  if (existing === undefined) {
    if (product.stock < 1) return lines;
    return lines.concat([
      { sku: product.sku, name: product.name, unit: product.price, qty: 1 },
    ]);
  }
  if (existing.qty >= product.stock) return lines;
  return lines.map((l) => (l.sku === product.sku ? { ...l, qty: l.qty + 1 } : l));
}

/** Stepping to zero removes the line; stepping past stock does nothing. */
export function adjustLine(
  lines: OrderLine[],
  sku: string,
  delta: number,
  stock: number,
): OrderLine[] {
  const existing = lines.find((l) => l.sku === sku);
  if (existing === undefined) return lines;
  const next = existing.qty + delta;
  if (next <= 0) return lines.filter((l) => l.sku !== sku);
  if (next > stock) return lines;
  return lines.map((l) => (l.sku === sku ? { ...l, qty: next } : l));
}

export function removeLine(lines: OrderLine[], sku: string): OrderLine[] {
  return lines.filter((l) => l.sku !== sku);
}

/** Search across name, SKU, category and barcode. */
export function filterProducts(
  products: Product[],
  query: string,
  category: string,
): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (q === "") return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.barcode.includes(q)
    );
  });
}

/** A scanner types the code then presses Enter: match barcode or SKU exactly. */
export function findByCode(products: Product[], code: string): Product | null {
  const c = code.trim().toLowerCase();
  if (c === "") return null;
  const hit = products.find(
    (p) => p.barcode === c || p.sku.toLowerCase() === c,
  );
  return hit === undefined ? null : hit;
}
