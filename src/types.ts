export type CurrencyCode = "USD" | "EUR" | "GBP" | "AED" | "JPY";

export interface Currency {
  code: CurrencyCode;
  label: string;
  symbol: string;
  /** Where the symbol sits relative to the digits. */
  position: "pre" | "post";
  /** 2 for most, 0 for JPY. Drives both formatting and parsing. */
  decimals: number;
  groupSeparator: string;
  decimalSeparator: string;
  /** Cash denominations offered as quick-tender chips, in minor units. */
  notes: number[];
}

/** Added on top (US sales tax) or already in the shelf price (EU/UK VAT). */
export type TaxMode = "added" | "included";

export interface Settings {
  currency: CurrencyCode;
  taxMode: TaxMode;
  /** Percent, e.g. 8.875 or 20. */
  taxRate: number;
}

export type CategoryName =
  | "Beverages"
  | "Snacks"
  | "Pantry"
  | "Household"
  | "Personal care";

export interface Product {
  sku: string;
  barcode: string;
  name: string;
  category: CategoryName;
  /** Shelf price in minor units of the store currency. */
  price: number;
  stock: number;
}

export interface OrderLine {
  sku: string;
  name: string;
  /** Unit price captured when the line was added. */
  unit: number;
  qty: number;
}

export interface HeldOrder {
  no: number;
  lines: OrderLine[];
  discount: number;
  /** ISO timestamp. */
  at: string;
}

export type PaymentMethod = "cash" | "card";

/**
 * A completed sale. Money figures and the tax/currency context are captured
 * at the moment of sale — changing a store setting afterwards must never
 * rewrite history.
 */
export interface Transaction {
  no: number;
  at: string;
  method: PaymentMethod;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  tax: number;
  /** What the customer owes: net + tax when added, net when included. */
  total: number;
  tip: number;
  /** total + tip. */
  charged: number;
  /** Cash only; 0 for card. */
  tender: number;
  cardBrand: string;
  cardLast4: string;
  currency: CurrencyCode;
  taxMode: TaxMode;
  taxRate: number;
}

export type View = "register" | "sales";
