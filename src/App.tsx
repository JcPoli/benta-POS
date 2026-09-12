import { useEffect, useMemo, useState } from "react";
import type { CurrencyCode, Product, Settings, View } from "./types";
import { useStore } from "./hooks/useStore";
import type { CompletedSale } from "./hooks/useStore";
import { filterProducts, findByCode } from "./lib/order";
import { parseAmount, plainAmount } from "./lib/money";
import { CommandBar } from "./components/CommandBar";
import { ScanBar } from "./components/ScanBar";
import { CategoryChips } from "./components/CategoryChips";
import { ProductGrid } from "./components/ProductGrid";
import { OrderPanel } from "./components/OrderPanel";
import { HeldPopover, TaxPopover } from "./components/Popovers";
import { PaymentSheet } from "./components/PaymentSheet";
import { SalesView } from "./components/SalesView";

type Popover = "none" | "held" | "tax";

export default function App() {
  const store = useStore();
  const { state, totals } = store;

  const [view, setView] = useState<View>("register");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [popover, setPopover] = useState<Popover>("none");
  const [paying, setPaying] = useState(false);
  const [receiptNo, setReceiptNo] = useState<number | null>(null);

  // Clicking anywhere outside a popover closes it.
  useEffect(() => {
    if (popover === "none") return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-pop]") !== null) return;
      setPopover("none");
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [popover]);

  const receipt = useMemo(
    () =>
      receiptNo === null
        ? null
        : state.transactions.find((t) => t.no === receiptNo) ?? null,
    [receiptNo, state.transactions],
  );

  const visible = useMemo(
    () => filterProducts(state.products, query, category),
    [state.products, query, category],
  );

  function addProduct(product: Product) {
    store.addProduct(product);
  }

  /** A scanner types a code then presses Enter. Fall back to a single match. */
  function submitScan(code: string) {
    const exact = findByCode(state.products, code);
    const target = exact ?? (visible.length === 1 ? visible[0] ?? null : null);
    if (target === null) return;
    addProduct(target);
    setQuery("");
  }

  function editDiscount() {
    if (state.order.length === 0) return;
    const current =
      totals.discount > 0
        ? plainAmount(totals.discount, state.settings.currency)
        : "";
    const raw = window.prompt(
      "Discount — a percentage (e.g. 10%) or an amount (e.g. 5):",
      current,
    );
    if (raw === null) return;
    const text = raw.trim();
    if (text === "") {
      store.setDiscount(0);
      return;
    }
    if (text.endsWith("%")) {
      const percent = Number(text.slice(0, -1).replace(",", "."));
      if (!Number.isFinite(percent) || percent < 0) return;
      store.setDiscount(
        Math.round((totals.subtotal * Math.min(percent, 100)) / 100),
      );
      return;
    }
    const amount = parseAmount(text, state.settings.currency);
    if (amount === null) return;
    store.setDiscount(amount);
  }

  function completeSale(sale: CompletedSale) {
    // The reducer records the sale; we only remember which order to show a
    // receipt for, so the transaction is never built twice.
    const no = state.orderNo;
    store.completeSale(sale);
    setReceiptNo(no);
  }

  function closeSheet() {
    setPaying(false);
    setReceiptNo(null);
  }

  function patchSettings(patch: Partial<Settings>) {
    store.patchSettings(patch);
  }

  function resetDemo() {
    if (
      window.confirm(
        "Reset demo data? Today's sales and any held orders in this browser will be replaced with the sample day.",
      )
    ) {
      store.resetDemo();
      setQuery("");
      setCategory("All");
      setPopover("none");
      closeSheet();
    }
  }

  return (
    <div
      data-print="shell"
      className="relative flex min-h-screen flex-col max-lg:h-auto lg:h-screen"
    >
      <CommandBar
        view={view}
        onView={setView}
        settings={state.settings}
        onCurrency={(code: CurrencyCode) => patchSettings({ currency: code })}
        heldCount={state.held.length}
        heldOpen={popover === "held"}
        onToggleHeld={() => setPopover(popover === "held" ? "none" : "held")}
        taxOpen={popover === "tax"}
        onToggleTax={() => setPopover(popover === "tax" ? "none" : "tax")}
      />

      {popover === "held" && (
        <HeldPopover
          held={state.held}
          settings={state.settings}
          onResume={(no) => {
            store.resumeOrder(no);
            setPopover("none");
          }}
          onDiscard={store.discardHeld}
        />
      )}
      {popover === "tax" && (
        <TaxPopover settings={state.settings} onPatch={patchSettings} />
      )}

      {view === "register" ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:px-[18px] lg:flex-row">
          <section
            aria-label="Products"
            className="flex min-h-0 min-w-0 flex-1 flex-col gap-3"
          >
            <ScanBar query={query} onQuery={setQuery} onSubmit={submitScan} />
            <CategoryChips active={category} onChange={setCategory} />
            <ProductGrid
              products={visible}
              order={state.order}
              currency={state.settings.currency}
              onAdd={addProduct}
            />
          </section>

          <OrderPanel
            orderNo={state.orderNo}
            order={state.order}
            products={state.products}
            totals={totals}
            settings={state.settings}
            onAdjust={store.adjust}
            onRemove={store.remove}
            onDiscount={editDiscount}
            onHold={store.holdOrder}
            onClear={store.clearOrder}
            onPay={() => setPaying(true)}
          />
        </div>
      ) : (
        <SalesView
          transactions={state.transactions}
          settings={state.settings}
          onReset={resetDemo}
        />
      )}

      {paying && (
        <PaymentSheet
          due={totals.total}
          settings={state.settings}
          completed={receipt}
          onComplete={completeSale}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
