import type { Settings, TaxMode } from "../types";

/**
 * Tax on a net amount (after discount).
 * "added"    — sales tax charged on top of the shelf price (US).
 * "included" — VAT already inside the shelf price (EU, UK, Gulf, JP).
 */
export function taxOn(net: number, mode: TaxMode, rate: number): number {
  if (net <= 0 || rate <= 0) return 0;
  if (mode === "added") return Math.round((net * rate) / 100);
  return Math.round(net - net / (1 + rate / 100));
}

/** What the customer owes for a given net amount. */
export function totalFor(net: number, mode: TaxMode, rate: number): number {
  return mode === "added" ? net + taxOn(net, mode, rate) : net;
}

/** e.g. "8.875% added" or "20% included". */
export function taxLabel(settings: Settings): string {
  const rate = String(settings.taxRate).replace(/\.0+$/, "");
  return rate + "% " + (settings.taxMode === "added" ? "added" : "included");
}

/** Accepts "8.875" or "8,875"; rejects anything outside 0–100. */
export function parseRate(input: string): number | null {
  const value = Number(input.trim().replace(",", "."));
  if (!Number.isFinite(value) || value < 0 || value > 100) return null;
  return value;
}
