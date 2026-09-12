import type { CategoryName, Product } from "../types";

/** Category accent colours. Kept as hex in TS, not class names, so Tailwind's
 *  content scanner never has to guess at dynamic classes. */
export const CATEGORY_COLOR: Record<CategoryName | "Other", string> = {
  Beverages: "#2e90fa",
  Snacks: "#f79009",
  Pantry: "#7a5af8",
  Household: "#15b79e",
  "Personal care": "#ee46bc",
  Other: "#667085",
};

export const CATEGORIES: CategoryName[] = [
  "Beverages",
  "Snacks",
  "Pantry",
  "Household",
  "Personal care",
];

/**
 * Internationally generic convenience-store stock, priced in minor units of
 * the store currency. The five categories match Bodega's inventory demo so
 * the two can share a store once both sit on a real backend.
 */
export const CATALOG: Product[] = [
  { sku: "BEV-001", barcode: "8801234500017", name: "Ground coffee 500g", category: "Beverages", price: 1290, stock: 42 },
  { sku: "BEV-002", barcode: "8801234500024", name: "Orange juice 1L", category: "Beverages", price: 380, stock: 8 },
  { sku: "BEV-003", barcode: "8801234500031", name: "Sparkling water 500ml", category: "Beverages", price: 150, stock: 36 },
  { sku: "BEV-004", barcode: "8801234500048", name: "Green tea, 20 bags", category: "Beverages", price: 460, stock: 22 },
  { sku: "SNK-001", barcode: "8801234500055", name: "Sea salt crackers", category: "Snacks", price: 320, stock: 19 },
  { sku: "SNK-002", barcode: "8801234500062", name: "Dark chocolate 100g", category: "Snacks", price: 540, stock: 0 },
  { sku: "SNK-003", barcode: "8801234500079", name: "Tortilla chips, sharing bag", category: "Snacks", price: 480, stock: 16 },
  { sku: "SNK-004", barcode: "8801234500086", name: "Mixed nuts 200g", category: "Snacks", price: 690, stock: 13 },
  { sku: "PAN-001", barcode: "8801234500093", name: "Long grain rice 1kg", category: "Pantry", price: 290, stock: 28 },
  { sku: "PAN-002", barcode: "8801234500109", name: "Olive oil 500ml", category: "Pantry", price: 940, stock: 14 },
  { sku: "PAN-003", barcode: "8801234500116", name: "Canned tuna, 4 pack", category: "Pantry", price: 780, stock: 6 },
  { sku: "PAN-004", barcode: "8801234500123", name: "Pasta 500g", category: "Pantry", price: 210, stock: 31 },
  { sku: "HHD-001", barcode: "8801234500130", name: "Dish soap 500ml", category: "Household", price: 340, stock: 5 },
  { sku: "HHD-002", barcode: "8801234500147", name: "Laundry detergent 1L", category: "Household", price: 850, stock: 12 },
  { sku: "HHD-003", barcode: "8801234500154", name: "Paper towels, 2 rolls", category: "Household", price: 420, stock: 9 },
  { sku: "PCR-001", barcode: "8801234500161", name: "Shampoo 400ml", category: "Personal care", price: 620, stock: 3 },
  { sku: "PCR-002", barcode: "8801234500178", name: "Hand soap 250ml", category: "Personal care", price: 380, stock: 24 },
  { sku: "PCR-003", barcode: "8801234500185", name: "Toothpaste 100ml", category: "Personal care", price: 450, stock: 11 },
];

export const STORE = {
  name: "Northside Market",
  register: "Register 1",
  receiptName: "NORTHSIDE MARKET",
  addressLine: "48 Harbour Street, Suite 2",
  phone: "+1 555 0134",
};

export const FIRST_ORDER_NO = 1042;
