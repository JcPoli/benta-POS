import { useEffect, useMemo, useRef, useState } from "react";
import type { CurrencyCode, Product, Settings, View } from "./types";
import { useStore } from "./hooks/useStore";
import type { CompletedSale } from "./hooks/useStore";
import { filterProducts, findByCode, refusalFor } from "./lib/order";
import { parseAmount, plainAmount } from "./lib/money";
import { CommandBar } from "./components/CommandBar";
import { ScanBar } from "./components/ScanBar";
import type { ScanNotice } from "./components/ScanBar";
import { CategoryChips } from "./components/CategoryChips";
import { ProductGrid } from "./components/ProductGrid";
import { OrderPanel } from "./components/OrderPanel";
import type { LineHighlight } from "./components/OrderPanel";
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
  const [notice, setNotice] = useState<ScanNotice | null>(null);
  const [highlight, setHighlight] = useState<LineHighlight | null>(null);

  // One counter for both: they only need an identity that changes per event.
  const eventId = useRef(0);

  /** A refused scan states its reason, then stops taking up the register. */
  useEffect(() => {
    if (notice === null) return;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function say(text: string) {
    eventId.current += 1;
    setNotice({ id: eventId.current, text });
  }

  /**
   * Till shortcuts. Single letters rather than function keys, which browsers
   * claim for their own; they only fire when focus is not in a field, so "/"
   * then typing a search still works, and a numeric barcode never collides.
   * The payment sheet owns the keyboard while it is open.
   */
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (paying || view !== "register") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }
      // Each of these mirrors a button that is disabled on an empty order, so
      // an empty order stays silent rather than scolding: the panel says so.
      if (state.order.length === 0) return;

      switch (event.key.toLowerCase()) {
        case "p":
          setPaying(true);
          break;
        case "h":
          store.holdOrder();
          break;
        case "c":
          store.clearOrder();
          break;
        case "d":
          editDiscount();
          break;
        default:
          return;
      }
      event.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // No dependency array on purpose: the handler closes over editDiscount and
    // the live order, and re-subscribing one listener per render costs less
    // than reasoning about which of those went stale.
  });

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

  /**
   * Returns false when stock refused the product. A tile cannot reach that
   * branch — it is already disabled — but a scanner bypasses the grid
   * entirely, and it used to do so in silence.
   */
  function addProduct(product: Product): boolean {
    const refusal = refusalFor(product, state.order);
    if (refusal !== null) {
      say(
        refusal === "sold-out"
          ? product.name + " — out of stock"
          : product.name +
              " — only " +
              product.stock +
              " in stock, already on this order",
      );
      return false;
    }
    store.addProduct(product);
    eventId.current += 1;
    setHighlight({ sku: product.sku, id: eventId.current });
    setNotice(null);
    return true;
  }

  /** A scanner types a code then presses Enter. Fall back to a single match. */
  function submitScan(code: string) {
    const text = code.trim();
    if (text === "") return;
    const exact = findByCode(state.products, text);
    const target = exact ?? (visible.length === 1 ? visible[0] ?? null : null);
    if (target === null) {
      say("No product matches “" + text + "”");
      return;
    }
    // A refusal keeps the code in the field, next to the reason it failed.
    if (addProduct(target)) setQuery("");
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
      setNotice(null);
      setHighlight(null);
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
            <ScanBar
              query={query}
              onQuery={setQuery}
              onSubmit={submitScan}
              notice={notice}
            />
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
            highlight={highlight}
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
