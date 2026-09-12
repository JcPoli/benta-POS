import type { HeldOrder, Settings, TaxMode } from "../types";
import { formatMoney } from "../lib/money";
import { parseRate } from "../lib/tax";
import { totalsOf } from "../lib/order";
import { formatTime, pluralize } from "../lib/format";

interface HeldProps {
  held: HeldOrder[];
  settings: Settings;
  onResume: (no: number) => void;
  onDiscard: (no: number) => void;
}

export function HeldPopover({ held, settings, onResume, onDiscard }: HeldProps) {
  return (
    <div
      role="dialog"
      aria-label="Held orders"
      data-pop="held"
      className="absolute right-4 top-[60px] z-[55] w-[min(330px,calc(100vw-32px))] overflow-hidden rounded-[15px] border border-line bg-surface shadow-sheet sm:right-[18px]"
    >
      <h3 className="border-b border-line px-[15px] pb-[11px] pt-[13px] text-sm font-bold">
        Held orders
      </h3>
      <div className="max-h-[300px] overflow-y-auto">
        {held.length === 0 ? (
          <p className="px-[15px] py-5 text-[13.5px] text-muted">
            Nothing on hold. Park an order to free the register for the next customer.
          </p>
        ) : (
          held.map((order) => {
            const totals = totalsOf(order.lines, order.discount, settings);
            return (
              <div
                key={order.no}
                className="flex items-center justify-between gap-2.5 border-b border-line px-[15px] py-[11px] last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Order #{order.no}</p>
                  <p className="text-xs text-muted tnum">
                    {pluralize(totals.units, "item", "items")} ·{" "}
                    {formatMoney(totals.total, settings.currency)} · {formatTime(order.at)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onResume(order.no)}
                    className="rounded-lg border border-line px-2.5 py-1.5 text-[12.5px] font-semibold hover:border-graphite"
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => onDiscard(order.no)}
                    className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-muted hover:text-danger"
                  >
                    Discard
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface TaxProps {
  settings: Settings;
  onPatch: (patch: Partial<Settings>) => void;
}

const MODES: { value: TaxMode; title: string; detail: string }[] = [
  { value: "added", title: "Added on top", detail: "US-style sales tax, added at checkout" },
  {
    value: "included",
    title: "Included in price",
    detail: "EU/UK-style VAT, already in the shelf price",
  },
];

export function TaxPopover({ settings, onPatch }: TaxProps) {
  return (
    <div
      role="dialog"
      aria-label="Tax settings"
      data-pop="tax"
      className="absolute right-4 top-[60px] z-[55] w-[min(310px,calc(100vw-32px))] rounded-[15px] border border-line bg-surface p-[15px] shadow-sheet sm:right-[18px]"
    >
      <h3 className="text-sm font-bold">Tax</h3>
      <p className="mt-0.5 text-[12.5px] text-muted">How tax behaves for this store.</p>

      <div className="mt-3 grid gap-[7px]">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            aria-pressed={settings.taxMode === mode.value}
            onClick={() => onPatch({ taxMode: mode.value })}
            className={
              "rounded-[11px] border px-3 py-2.5 text-left " +
              (settings.taxMode === mode.value
                ? "border-graphite shadow-[inset_0_0_0_1px_#15161b]"
                : "border-line hover:border-line-strong")
            }
          >
            <b className="block text-[13.5px] font-semibold">{mode.title}</b>
            <span className="text-xs text-muted">{mode.detail}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <label htmlFor="tax-rate" className="text-[13px] text-muted">
          Rate
        </label>
        <input
          id="tax-rate"
          type="text"
          inputMode="decimal"
          defaultValue={String(settings.taxRate)}
          onChange={(event) => {
            const rate = parseRate(event.target.value);
            if (rate !== null) onPatch({ taxRate: rate });
          }}
          className="w-[84px] rounded-[9px] border border-line px-2.5 py-2 tnum"
        />
        <span className="text-[13px] text-muted">%</span>
      </div>
    </div>
  );
}
