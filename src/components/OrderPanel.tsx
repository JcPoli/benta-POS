import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { OrderLine, Product, Settings } from "../types";
import type { OrderTotals } from "../lib/order";
import { formatMoney } from "../lib/money";
import { taxLabel } from "../lib/tax";
import { pluralize } from "../lib/format";
import { CartIcon, MinusIcon, PlusIcon } from "./Icons";

/**
 * The line a just-added product landed on. The id changes on every add, so
 * adding the same SKU twice confirms twice.
 */
export interface LineHighlight {
  sku: string;
  id: number;
}

interface Props {
  orderNo: number;
  order: OrderLine[];
  products: Product[];
  highlight: LineHighlight | null;
  totals: OrderTotals;
  settings: Settings;
  onAdjust: (sku: string, delta: number) => void;
  onRemove: (sku: string) => void;
  onDiscount: () => void;
  onHold: () => void;
  onClear: () => void;
  onPay: () => void;
}

export function OrderPanel({
  orderNo,
  order,
  products,
  highlight,
  totals,
  settings,
  onAdjust,
  onRemove,
  onDiscount,
  onHold,
  onClear,
  onPay,
}: Props) {
  const empty = order.length === 0;
  const currency = settings.currency;
  const touchedRef = useRef<HTMLDivElement | null>(null);

  /**
   * Void sits a few pixels from the minus key and throws away the whole line,
   * so it asks once. Armed on the line's SKU, not a boolean, so arming one row
   * never arms another.
   */
  const [armed, setArmed] = useState<string | null>(null);

  // Anything that changes the order under the cashier disarms it.
  useEffect(() => {
    setArmed(null);
  }, [order]);

  useEffect(() => {
    if (armed === null) return;
    const timer = window.setTimeout(() => setArmed(null), 3500);
    return () => window.clearTimeout(timer);
  }, [armed]);

  /**
   * Past a handful of items the newest line lands below the fold, so the
   * cashier cannot see what they just rang up. Bring it into view and flash it
   * once. Driven imperatively because the same class name on a re-render would
   * not restart the animation; Element.animate always does.
   */
  useEffect(() => {
    const row = touchedRef.current;
    if (row === null || highlight === null) return;
    row.scrollIntoView({ block: "nearest" });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    row.animate(
      [
        { backgroundColor: "rgba(0, 168, 112, 0.14)" },
        { backgroundColor: "rgba(0, 168, 112, 0)" },
      ],
      { duration: 900, easing: "ease-out" },
    );
  }, [highlight]);

  return (
    <aside
      aria-label="Current order"
      className="flex min-h-0 w-full shrink-0 flex-col rounded-[18px] border border-line bg-surface shadow-lift lg:w-[372px]"
    >
      <div className="flex items-start justify-between gap-2.5 border-b border-line px-[17px] pb-[13px] pt-[15px]">
        <span className="leading-tight">
          <span className="block text-[15.5px] font-bold">Order #{orderNo}</span>
          <span className="block text-[12.5px] text-muted">
            {empty ? "Empty" : pluralize(totals.units, "item", "items")}
          </span>
        </span>
        <span className="flex gap-1.5">
          <PanelAction label="Hold" onClick={onHold} disabled={empty} />
          <PanelAction label="Clear" onClick={onClear} disabled={empty} />
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto max-lg:max-h-[320px]">
        {empty ? (
          <div className="px-5 py-10 text-center text-muted">
            <span className="inline-block text-line-strong">
              <CartIcon />
            </span>
            <b className="mb-0.5 mt-2.5 block font-semibold text-ink">No items yet</b>
            <span className="text-[13.5px]">Scan a barcode or tap a product to begin.</span>
          </div>
        ) : (
          order.map((line) => {
            const product = products.find((p) => p.sku === line.sku);
            const atStockCeiling = product !== undefined && line.qty >= product.stock;
            return (
              <div
                key={line.sku}
                ref={highlight !== null && highlight.sku === line.sku ? touchedRef : null}
                className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 border-b border-line px-[17px] py-3"
              >
                <div>
                  <p className="text-[14.5px] font-semibold">{line.name}</p>
                  <p className="text-xs text-muted tnum">
                    {formatMoney(line.unit, currency)} each
                  </p>
                </div>
                <p className="text-right font-bold tnum">
                  {formatMoney(line.unit * line.qty, currency)}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <StepButton
                    label={"Reduce " + line.name}
                    onClick={() => onAdjust(line.sku, -1)}
                  >
                    <MinusIcon />
                  </StepButton>
                  <span className="min-w-[34px] text-center text-sm font-semibold tnum">
                    {line.qty}
                  </span>
                  <StepButton
                    label={"Add one " + line.name}
                    disabled={atStockCeiling}
                    onClick={() => onAdjust(line.sku, 1)}
                  >
                    <PlusIcon />
                  </StepButton>
                  <button
                    type="button"
                    onClick={() =>
                      armed === line.sku ? onRemove(line.sku) : setArmed(line.sku)
                    }
                    className={
                      // inset-x-0 gives the pseudo-element a width; -inset-y-1
                      // then lifts a 36px control to a 44px target.
                      "relative ml-1 rounded-[10px] px-2.5 py-2.5 text-[12.5px] font-semibold before:absolute before:inset-x-0 before:-inset-y-1 before:content-[''] " +
                      (armed === line.sku
                        ? "bg-danger-soft text-danger"
                        : "text-muted hover:text-danger")
                    }
                  >
                    {armed === line.sku ? "Remove?" : "Void"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-line px-[17px] pt-[13px]">
        <SumRow label="Subtotal" value={formatMoney(totals.subtotal, currency)} />
        <div className="flex items-center justify-between py-[3px] text-sm text-muted">
          <button
            type="button"
            onClick={onDiscount}
            className="text-[13px] underline underline-offset-2 hover:text-ink"
          >
            {totals.discount > 0 ? "Change discount" : "Add discount"}
          </button>
          <span className="tnum">
            {totals.discount > 0 ? "-" + formatMoney(totals.discount, currency) : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between py-[3px] text-sm text-muted">
          <span>
            Tax <span className="text-[11.5px] text-muted-soft">({taxLabel(settings)})</span>
          </span>
          <span className="tnum">{formatMoney(totals.tax, currency)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-line pt-3 text-[15px] font-semibold">
          <span>Total</span>
          <span aria-live="polite" className="text-[27px] font-extrabold tracking-[-0.025em] tnum">
            {formatMoney(totals.total, currency)}
          </span>
        </div>
      </div>

      <div className="px-[17px] pb-4 pt-[13px]">
        <button
          type="button"
          disabled={empty}
          onClick={onPay}
          className={
            "flex w-full items-center justify-between rounded-[13px] p-4 text-[16.5px] font-bold " +
            (empty
              ? "cursor-not-allowed bg-surface-alt text-muted-soft"
              : "bg-em text-white shadow-pay hover:bg-em-dark")
          }
        >
          <span>Pay</span>
          <span className="tnum">{formatMoney(totals.total, currency)}</span>
        </button>
        {/* Only where a keyboard is likely; a touch till has no use for it. */}
        <p className="mt-2.5 hidden text-[11.5px] leading-relaxed text-muted lg:block">
          <Kbd>P</Kbd> pay <Kbd>H</Kbd> hold <Kbd>C</Kbd> clear <Kbd>D</Kbd>{" "}
          discount <Kbd>/</Kbd> search
        </p>

        <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted">
          Demo mode: orders stay in this browser. Production adds Supabase for
          shared records, multiple registers, and staff accounts.
        </p>
      </div>
    </aside>
  );
}

function PanelAction({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-[9px] border border-line px-[11px] py-1.5 text-[13px] font-semibold text-muted hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-line disabled:hover:text-muted"
    >
      {label}
    </button>
  );
}

function StepButton({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      /* 40px visually, 44x48 to the finger. The pseudo-element grows the hit
         box by less than the 6px gap, so neighbouring keys never overlap. */
      className="relative grid h-10 w-10 place-items-center rounded-[11px] border border-line text-muted before:absolute before:-inset-x-0.5 before:-inset-y-1 before:content-[''] hover:border-graphite hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
    >
      {children}
    </button>
  );
}

/** Matches the "/" cap on the scan field, so the two read as one idiom. */
function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-[5px] border border-line-strong bg-surface-alt px-[5px] py-px font-sans text-[11px] font-semibold text-muted">
      {children}
    </kbd>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-[3px] text-sm text-muted">
      <span>{label}</span>
      <span className="tnum">{value}</span>
    </div>
  );
}
