import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { PaymentMethod, Settings, Transaction } from "../types";
import type { CompletedSale } from "../hooks/useStore";
import { CURRENCIES, formatMoney } from "../lib/money";
import { CardIcon, CashIcon, CloseIcon, TerminalIcon } from "./Icons";
import { Receipt } from "./Receipt";

interface Props {
  due: number;
  settings: Settings;
  /** Set once the sale is done, which swaps the sheet over to the receipt. */
  completed: Transaction | null;
  onComplete: (sale: CompletedSale) => void;
  onClose: () => void;
}

const TIP_PERCENTS = [0, 15, 18, 20];

export function PaymentSheet({ due, settings, completed, onComplete, onClose }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [tenderDigits, setTenderDigits] = useState("");
  const [tipPercent, setTipPercent] = useState(0);
  const [approved, setApproved] = useState(false);
  const [authCode, setAuthCode] = useState("");

  const currency = settings.currency;

  const entered = tenderDigits !== "";
  const tender = entered ? Number.parseInt(tenderDigits, 10) : 0;
  const change = tender - due;
  const tip = method === "card" ? Math.round((due * tipPercent) / 100) : 0;
  const canComplete = method === "cash" ? entered && change >= 0 : approved;

  function press(key: string) {
    if (key === "back") {
      setTenderDigits((current) => current.slice(0, -1));
      return;
    }
    setTenderDigits((current) => (current.length < 9 ? current + key : current));
  }

  function switchMethod(next: PaymentMethod) {
    setMethod(next);
    setApproved(false);
    setAuthCode("");
  }

  function tapTerminal() {
    if (approved) return;
    setApproved(true);
    setAuthCode(String(100 + Math.floor(Math.random() * 800)));
  }

  const showReceipt = completed !== null;

  /**
   * A cashier with a keyboard is faster than any on-screen pad, so the sheet
   * accepts one: digits build the tender in minor units exactly as the keypad
   * does, Backspace corrects, Enter completes. Modifier combinations are left
   * alone so Ctrl+P still prints the receipt.
   */
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "Escape") {
        onClose();
        return;
      }

      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }
      // A focused button already answers Enter natively. Acting here too would
      // run the sale twice — the reducer refuses the second, but don't rely on
      // that to paper over a double dispatch.
      if (event.key === "Enter" && target instanceof HTMLButtonElement) return;

      // Nothing to type into on the receipt; Enter starts the next order.
      if (showReceipt) {
        if (event.key === "Enter") onClose();
        return;
      }
      if (event.key === "Enter") {
        if (canComplete) onComplete({ method, tender, tip });
        return;
      }
      if (method !== "cash") return;
      if (event.key === "Backspace") {
        event.preventDefault();
        press("back");
        return;
      }
      if (/^[0-9]$/.test(event.key)) press(event.key);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // Same reasoning as the register shortcuts: no array, no stale tender.
  });

  return (
    <div
      data-print="root"
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      <div
        data-print="hide"
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 animate-fade-in bg-[rgba(16,18,24,0.5)] motion-reduce:animate-none"
      />
      <div
        data-print="receipt"
        className="sheet-in absolute inset-2 left-auto flex w-[min(452px,calc(100%-16px))] flex-col overflow-hidden rounded-[18px] bg-surface shadow-sheet max-sm:sheet-up max-sm:inset-x-2 max-sm:bottom-2 max-sm:top-auto max-sm:max-h-[92svh] max-sm:w-auto"
      >
        <div
          data-print="hide"
          className="flex shrink-0 items-center justify-between gap-2.5 border-b border-line px-[18px] pb-[13px] pt-[15px]"
        >
          <span className="leading-tight">
            <span id="sheet-title" className="block text-base font-bold">
              {showReceipt ? "Sale complete" : "Take payment"}
            </span>
            <span className="block text-[12.5px] text-muted">
              {showReceipt
                ? completed.method === "cash"
                  ? "Change " + formatMoney(completed.tender - completed.total, completed.currency)
                  : "Charged " + formatMoney(completed.charged, completed.currency)
                : method === "cash"
                  ? "Cash"
                  : "Card"}
            </span>
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-[9px] text-muted hover:bg-surface-alt hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>

        {/* A long receipt — cash, which adds two rows, and many order lines —
            must scroll inside the sheet rather than be clipped by it. */}
        {showReceipt ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Receipt transaction={completed} />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-4">
            <div role="group" aria-label="Payment method" className="grid grid-cols-2 gap-2">
              <MethodButton
                label="Cash"
                icon={<CashIcon />}
                active={method === "cash"}
                onClick={() => switchMethod("cash")}
              />
              <MethodButton
                label="Card"
                icon={<CardIcon />}
                active={method === "card"}
                onClick={() => switchMethod("card")}
              />
            </div>

            <div className="mt-3.5 rounded-[14px] bg-graphite px-[17px] py-[15px] text-white">
              <p className="text-[13px] text-[rgba(255,255,255,0.62)]">Amount due</p>
              <p className="text-[31px] font-extrabold tracking-[-0.03em] tnum">
                {formatMoney(due, currency)}
              </p>
            </div>

            {method === "cash" ? (
              <>
                <div className="mt-3.5 flex items-baseline justify-between gap-2.5 rounded-xl border border-line bg-surface-alt px-3.5 py-3">
                  <span className="text-[13px] text-muted">Cash received</span>
                  <span className="text-[23px] font-bold tracking-[-0.02em] tnum">
                    {formatMoney(tender, currency)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-[7px]">
                  {CURRENCIES[currency].notes.map((note) => (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setTenderDigits(String(note))}
                      className="rounded-[10px] border border-line bg-surface px-[13px] py-2.5 text-[13.5px] font-semibold hover:border-graphite"
                    >
                      {formatMoney(note, currency)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTenderDigits(String(due))}
                    className="rounded-[10px] border border-graphite bg-graphite px-[13px] py-2.5 text-[13.5px] font-semibold text-white"
                  >
                    Exact
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"].map((key) => (
                    <button
                      key={key}
                      type="button"
                      aria-label={key === "back" ? "Backspace" : undefined}
                      onClick={() => press(key)}
                      className={
                        "rounded-xl border border-line bg-surface py-3.5 font-bold hover:border-graphite " +
                        (key === "00" || key === "back"
                          ? "text-[15px] text-muted"
                          : "text-[18.5px]")
                      }
                    >
                      {key === "back" ? "\u232B" : key}
                    </button>
                  ))}
                </div>

                {/* Until something is entered the row stays neutral — a cashier
                    should not be told the payment is short before they type. */}
                <CalcRow
                  label={entered && change < 0 ? "Still short" : "Change"}
                  value={formatMoney(entered ? Math.abs(change) : 0, currency)}
                  tone={!entered ? "idle" : change >= 0 ? "ok" : "short"}
                />

                <p className="mt-2.5 hidden text-[11.5px] leading-relaxed text-muted lg:block">
                  Or type the amount on the keyboard — Backspace corrects, Enter
                  completes the sale.
                </p>
              </>
            ) : (
              <>
                <p className="mt-3.5 text-[13px] text-muted">Add a tip</p>
                <div role="group" aria-label="Tip" className="mt-3 grid grid-cols-4 gap-[7px]">
                  {TIP_PERCENTS.map((percent) => (
                    <button
                      key={percent}
                      type="button"
                      aria-pressed={tipPercent === percent}
                      onClick={() => setTipPercent(percent)}
                      className={
                        "rounded-[11px] border bg-surface px-1 py-2.5 text-[14.5px] font-bold " +
                        (tipPercent === percent
                          ? "border-graphite shadow-select"
                          : "border-line hover:border-line-strong")
                      }
                    >
                      {percent === 0 ? "None" : percent + "%"}
                      {percent !== 0 && (
                        <small className="mt-px block text-[11px] font-medium text-muted tnum">
                          {formatMoney(Math.round((due * percent) / 100), currency)}
                        </small>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={tapTerminal}
                  className={
                    "mt-3.5 w-full rounded-[14px] border px-[18px] py-[22px] text-center " +
                    (approved
                      ? "border-solid border-em-ring bg-em-soft"
                      : "border-dashed border-line-strong hover:border-graphite")
                  }
                >
                  <span className={approved ? "text-em-dark" : "text-muted-soft"}>
                    <TerminalIcon />
                  </span>
                  <b
                    className={
                      "mb-0.5 mt-2 block font-semibold " + (approved ? "text-em-dark" : "text-ink")
                    }
                  >
                    {approved ? "Approved" : "Insert, tap, or swipe"}
                  </b>
                  <span className="text-[13.5px] text-muted">
                    {approved
                      ? "VISA •••• 4242 — authorisation 00" + authCode
                      : "Simulated terminal — no real card is charged."}
                  </span>
                </button>

                <CalcRow
                  label="Charging"
                  value={formatMoney(due + tip, currency)}
                  tone={approved ? "ok" : "idle"}
                />
              </>
            )}
          </div>
        )}

        <div
          data-print="hide"
          /* Clears the iPhone home indicator; 1rem everywhere the inset is 0. */
          className="flex shrink-0 gap-2.5 border-t border-line px-[18px] pb-[max(1rem,env(safe-area-inset-bottom))] pt-[13px]"
        >
          {showReceipt ? (
            <>
              <SheetSecondary label="Print" onClick={() => window.print()} />
              <SheetPrimary label="New order" onClick={onClose} />
            </>
          ) : (
            <>
              <SheetSecondary label="Cancel" onClick={onClose} />
              <SheetPrimary
                label="Complete sale"
                disabled={!canComplete}
                onClick={() => onComplete({ method, tender, tip })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MethodButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        "flex items-center justify-center gap-2 rounded-xl border bg-surface px-3 py-3.5 text-[14.5px] font-semibold " +
        (active
          ? "border-graphite text-ink shadow-select"
          : "border-line text-muted hover:border-line-strong hover:text-ink")
      }
    >
      {icon}
      {label}
    </button>
  );
}

function CalcRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "idle" | "ok" | "short";
}) {
  const toneClass =
    tone === "ok"
      ? "border-em-ring bg-em-soft"
      : tone === "short"
        ? "border-danger-ring bg-danger-soft"
        : "border-line bg-surface-alt";
  const valueClass =
    tone === "ok" ? "text-em-dark" : tone === "short" ? "text-danger" : "text-ink";
  return (
    <div
      className={
        "mt-3.5 flex items-baseline justify-between rounded-xl border px-4 py-3.5 " + toneClass
      }
    >
      <span className="text-[13.5px] text-muted">{label}</span>
      <span className={"text-[22px] font-extrabold tracking-[-0.02em] tnum " + valueClass}>
        {value}
      </span>
    </div>
  );
}

function SheetPrimary({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "flex-1 rounded-xl p-[15px] text-base font-bold " +
        (disabled
          ? "cursor-not-allowed bg-surface-alt text-muted-soft"
          : "bg-em text-white hover:bg-em-dark")
      }
    >
      {label}
    </button>
  );
}

function SheetSecondary({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-line px-[17px] py-[15px] font-semibold hover:border-line-strong"
    >
      {label}
    </button>
  );
}
