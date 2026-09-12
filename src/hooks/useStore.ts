import { useEffect, useMemo, useReducer } from "react";
import type {
  HeldOrder,
  OrderLine,
  PaymentMethod,
  Product,
  Settings,
  Transaction,
} from "../types";
import {
  DEFAULT_SETTINGS,
  seedNextOrderNo,
  seedProducts,
  seedTransactions,
} from "../data/seed";
import { addLine, adjustLine, removeLine, subtotalOf, totalsOf } from "../lib/order";

/**
 * Demo persistence only. The production version replaces this layer with
 * Supabase (Postgres, Auth, row-level security) behind the same action API,
 * so nothing above this file has to change.
 */
const STORAGE_KEY = "benta.pos.v1";

export interface StoreState {
  products: Product[];
  order: OrderLine[];
  discount: number;
  orderNo: number;
  held: HeldOrder[];
  transactions: Transaction[];
  settings: Settings;
}

export interface CompletedSale {
  method: PaymentMethod;
  /** Cash received; ignored for card payments. */
  tender: number;
  /** Gratuity in minor units; card payments only. */
  tip: number;
}

type Action =
  | { type: "addProduct"; product: Product }
  | { type: "adjust"; sku: string; delta: number }
  | { type: "remove"; sku: string }
  | { type: "setDiscount"; amount: number }
  | { type: "clearOrder" }
  | { type: "holdOrder" }
  | { type: "resumeOrder"; no: number }
  | { type: "discardHeld"; no: number }
  | { type: "completeSale"; sale: CompletedSale }
  | { type: "patchSettings"; patch: Partial<Settings> }
  | { type: "resetDemo" };

function initialState(): StoreState {
  return {
    products: seedProducts(),
    order: [],
    discount: 0,
    orderNo: seedNextOrderNo(),
    held: [],
    transactions: seedTransactions(DEFAULT_SETTINGS),
    settings: { ...DEFAULT_SETTINGS },
  };
}

function stockOf(products: Product[], sku: string): number {
  const product = products.find((p) => p.sku === sku);
  return product === undefined ? 0 : product.stock;
}

/** Discount can never outlive the lines it was applied to. */
function cappedDiscount(lines: OrderLine[], discount: number): number {
  if (lines.length === 0) return 0;
  return Math.min(Math.max(0, discount), subtotalOf(lines));
}

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "addProduct": {
      const order = addLine(state.order, action.product);
      if (order === state.order) return state;
      return { ...state, order };
    }

    case "adjust": {
      const order = adjustLine(
        state.order,
        action.sku,
        action.delta,
        stockOf(state.products, action.sku),
      );
      if (order === state.order) return state;
      return { ...state, order, discount: cappedDiscount(order, state.discount) };
    }

    case "remove": {
      const order = removeLine(state.order, action.sku);
      return { ...state, order, discount: cappedDiscount(order, state.discount) };
    }

    case "setDiscount":
      return { ...state, discount: cappedDiscount(state.order, action.amount) };

    case "clearOrder":
      return { ...state, order: [], discount: 0 };

    case "holdOrder": {
      if (state.order.length === 0) return state;
      const held: HeldOrder = {
        no: state.orderNo,
        lines: state.order,
        discount: state.discount,
        at: new Date().toISOString(),
      };
      return {
        ...state,
        held: state.held.concat([held]),
        order: [],
        discount: 0,
        orderNo: state.orderNo + 1,
      };
    }

    case "resumeOrder": {
      const target = state.held.find((h) => h.no === action.no);
      if (target === undefined) return state;
      const remaining = state.held.filter((h) => h.no !== action.no);
      // An order already on the register is parked rather than discarded.
      const parked: HeldOrder[] =
        state.order.length === 0
          ? remaining
          : remaining.concat([
              {
                no: state.orderNo,
                lines: state.order,
                discount: state.discount,
                at: new Date().toISOString(),
              },
            ]);
      return {
        ...state,
        order: target.lines,
        discount: target.discount,
        orderNo: target.no,
        held: parked,
      };
    }

    case "discardHeld":
      return { ...state, held: state.held.filter((h) => h.no !== action.no) };

    case "completeSale": {
      if (state.order.length === 0) return state;
      const totals = totalsOf(state.order, state.discount, state.settings);
      const tip = action.sale.method === "card" ? Math.max(0, action.sale.tip) : 0;
      const transaction: Transaction = {
        no: state.orderNo,
        at: new Date().toISOString(),
        method: action.sale.method,
        lines: state.order,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        tip,
        charged: totals.total + tip,
        tender: action.sale.method === "cash" ? action.sale.tender : 0,
        cardBrand: action.sale.method === "card" ? "VISA" : "",
        cardLast4: action.sale.method === "card" ? "4242" : "",
        currency: state.settings.currency,
        taxMode: state.settings.taxMode,
        taxRate: state.settings.taxRate,
      };
      // The register is the stock source in this demo: selling decrements it.
      const sold = new Map(state.order.map((l) => [l.sku, l.qty]));
      return {
        ...state,
        products: state.products.map((p) => {
          const qty = sold.get(p.sku);
          return qty === undefined ? p : { ...p, stock: Math.max(0, p.stock - qty) };
        }),
        transactions: state.transactions.concat([transaction]),
        order: [],
        discount: 0,
        orderNo: state.orderNo + 1,
      };
    }

    case "patchSettings":
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case "resetDemo":
      return initialState();
  }
}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed !== null && typeof parsed === "object") {
        const candidate = parsed as Partial<StoreState>;
        if (
          Array.isArray(candidate.products) &&
          Array.isArray(candidate.transactions) &&
          candidate.settings !== undefined
        ) {
          return { ...initialState(), ...candidate } as StoreState;
        }
      }
    }
  } catch {
    // Corrupted, absent or blocked storage: fall through to a fresh demo.
  }
  return initialState();
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked: the register keeps working in memory.
    }
  }, [state]);

  const actions = useMemo(
    () => ({
      addProduct: (product: Product) => dispatch({ type: "addProduct", product }),
      adjust: (sku: string, delta: number) => dispatch({ type: "adjust", sku, delta }),
      remove: (sku: string) => dispatch({ type: "remove", sku }),
      setDiscount: (amount: number) => dispatch({ type: "setDiscount", amount }),
      clearOrder: () => dispatch({ type: "clearOrder" }),
      holdOrder: () => dispatch({ type: "holdOrder" }),
      resumeOrder: (no: number) => dispatch({ type: "resumeOrder", no }),
      discardHeld: (no: number) => dispatch({ type: "discardHeld", no }),
      completeSale: (sale: CompletedSale) => dispatch({ type: "completeSale", sale }),
      patchSettings: (patch: Partial<Settings>) =>
        dispatch({ type: "patchSettings", patch }),
      resetDemo: () => dispatch({ type: "resetDemo" }),
    }),
    [],
  );

  const totals = useMemo(
    () => totalsOf(state.order, state.discount, state.settings),
    [state.order, state.discount, state.settings],
  );

  return { state, totals, ...actions };
}
