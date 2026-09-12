import type { CurrencyCode, Settings, View } from "../types";
import { CURRENCIES, CURRENCY_CODES } from "../lib/money";
import { taxLabel } from "../lib/tax";
import { STORE } from "../data/catalog";
import { Segmented } from "./Segmented";
import { ChevronIcon, RegisterIcon } from "./Icons";

interface Props {
  view: View;
  onView: (view: View) => void;
  settings: Settings;
  onCurrency: (code: CurrencyCode) => void;
  heldCount: number;
  heldOpen: boolean;
  onToggleHeld: () => void;
  taxOpen: boolean;
  onToggleTax: () => void;
}

export function CommandBar({
  view,
  onView,
  settings,
  onCurrency,
  heldCount,
  heldOpen,
  onToggleHeld,
  taxOpen,
  onToggleTax,
}: Props) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-line bg-surface px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-[18px]">
      <div className="flex items-center gap-2.5">
        <span className="grid h-[33px] w-[33px] place-items-center rounded-[10px] bg-graphite text-white">
          <RegisterIcon />
        </span>
        <span className="leading-tight">
          <span className="block text-[16.5px] font-extrabold tracking-[-0.02em]">Benta</span>
          <span className="block text-xs text-muted">
            {STORE.name} — {STORE.register}
          </span>
        </span>
      </div>

      <Segmented view={view} onChange={onView} />

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          data-pop="held"
          aria-expanded={heldOpen}
          onClick={onToggleHeld}
          className="flex items-center gap-[7px] rounded-[10px] border border-line bg-surface px-[11px] py-[7px] text-[13.5px] font-semibold text-muted hover:border-line-strong hover:text-ink"
        >
          Held
          {/* A zero badge is noise: nothing is held, and the panel says so. */}
          {heldCount > 0 && (
            <span className="grid h-[19px] min-w-[19px] place-items-center rounded-full bg-graphite px-[5px] text-[11.5px] font-bold text-white tnum">
              {heldCount}
            </span>
          )}
        </button>

        <span className="relative">
          <select
            aria-label="Store currency"
            value={settings.currency}
            onChange={(event) => onCurrency(event.target.value as CurrencyCode)}
            className="cursor-pointer appearance-none rounded-[10px] border border-line bg-surface py-[7px] pl-[11px] pr-7 text-[13.5px] font-semibold text-muted hover:border-line-strong hover:text-ink"
          >
            {CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {CURRENCIES[code].label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted">
            <ChevronIcon />
          </span>
        </span>

        <button
          type="button"
          data-pop="tax"
          aria-expanded={taxOpen}
          onClick={onToggleTax}
          className="rounded-[10px] border border-line bg-surface px-[11px] py-[7px] text-[13.5px] font-semibold text-muted hover:border-line-strong hover:text-ink"
        >
          Tax <span className="text-ink">{taxLabel(settings)}</span>
        </button>
      </div>
    </header>
  );
}
