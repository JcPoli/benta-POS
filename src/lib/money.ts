import type { Currency, CurrencyCode } from "../types";

/**
 * Currency is a store setting. Symbol, placement, separators and the number
 * of decimals all follow it — JPY genuinely has none, which is the case that
 * catches naive money code.
 */
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: {
    code: "USD", label: "USD $", symbol: "$", position: "pre",
    decimals: 2, groupSeparator: ",", decimalSeparator: ".",
    notes: [500, 1000, 2000, 5000, 10000],
  },
  EUR: {
    code: "EUR", label: "EUR €", symbol: "€", position: "pre",
    decimals: 2, groupSeparator: ".", decimalSeparator: ",",
    notes: [500, 1000, 2000, 5000, 10000],
  },
  GBP: {
    code: "GBP", label: "GBP £", symbol: "£", position: "pre",
    decimals: 2, groupSeparator: ",", decimalSeparator: ".",
    notes: [500, 1000, 2000, 5000, 10000],
  },
  AED: {
    code: "AED", label: "AED د.إ", symbol: "AED ", position: "pre",
    decimals: 2, groupSeparator: ",", decimalSeparator: ".",
    notes: [1000, 2000, 5000, 10000, 20000],
  },
  JPY: {
    code: "JPY", label: "JPY ¥", symbol: "¥", position: "pre",
    decimals: 0, groupSeparator: ",", decimalSeparator: ".",
    notes: [100, 500, 1000, 5000, 10000],
  },
};

export const CURRENCY_CODES: CurrencyCode[] = ["USD", "EUR", "GBP", "AED", "JPY"];

/** Smallest-unit multiplier: 100 for cents, 1 for yen. */
export function minorFactor(code: CurrencyCode): number {
  return Math.pow(10, CURRENCIES[code].decimals);
}

function group(digits: string, separator: string): string {
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += separator;
    out += digits.charAt(i);
  }
  return out;
}

/** Format minor units for display, e.g. 123456789 -> "€1.234.567,89". */
export function formatMoney(minor: number, code: CurrencyCode): string {
  const c = CURRENCIES[code];
  const negative = minor < 0;
  const value = Math.abs(Math.round(minor));
  const factor = minorFactor(code);
  const whole = Math.floor(value / factor);
  let body = group(String(whole), c.groupSeparator);
  if (c.decimals > 0) {
    body += c.decimalSeparator + String(value - whole * factor).padStart(c.decimals, "0");
  }
  const withSymbol = c.position === "pre" ? c.symbol + body : body + c.symbol;
  return (negative ? "-" : "") + withSymbol;
}

/** Plain machine-readable amount for CSV, e.g. "1234.56" (or "123456" in JPY). */
export function plainAmount(minor: number, code: CurrencyCode): string {
  return (minor / minorFactor(code)).toFixed(CURRENCIES[code].decimals);
}

/**
 * Parse a typed major-unit amount into minor units.
 * Accepts either separator as the decimal point, so an operator typing
 * "12,50" gets what they expect. Returns null when unusable.
 */
export function parseAmount(input: string, code: CurrencyCode): number | null {
  const cleaned = input.trim().replace(/\s/g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "." || !/^\d*\.?\d*$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * minorFactor(code));
}
