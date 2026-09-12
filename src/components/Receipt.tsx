import type { Transaction } from "../types";
import { formatMoney } from "../lib/money";
import { formatDate } from "../lib/format";
import { STORE } from "../data/catalog";

/**
 * Receipt layout follows international convention: no local tax-registration
 * block, an unambiguous date, and a tax line whose wording depends on whether
 * tax was added at the till or already sat in the shelf price.
 */
export function Receipt({ transaction }: { transaction: Transaction }) {
  const t = transaction;
  const money = (minor: number) => formatMoney(minor, t.currency);
  const rate = String(t.taxRate).replace(/\.0+$/, "");

  return (
    <div className="px-[18px] py-4">
      <div className="mx-auto max-w-[330px] rounded-[10px] border border-line bg-surface px-[18px] py-5 font-mono text-xs leading-[1.7] text-[#1d1e24]">
        <div className="text-center">
          <p className="text-[13.5px] font-medium tracking-[0.06em]">{STORE.receiptName}</p>
          <p>{STORE.addressLine}</p>
          <p>{STORE.phone}</p>
        </div>

        <Rule />
        <Row label="Order" value={"#" + t.no} />
        <Row label="Date" value={formatDate(t.at)} />
        <Row label="Register" value={STORE.register.replace("Register ", "") + " — Staff: Demo"} />

        <Rule />
        {/* A long name wraps onto a second line the way a till roll does; it is
            never shortened, since the customer has to recognise what they paid
            for. break-inside keeps a line's two rows on the same printed page. */}
        {t.lines.map((line) => (
          <div key={line.sku} className="break-inside-avoid">
            <Row label={line.name} value={money(line.unit * line.qty)} />
            <p className="text-muted">
              {"  " + line.qty + " \u00d7 " + money(line.unit)}
            </p>
          </div>
        ))}

        {/* Totals through the tender stay together: a receipt split between
            "TOTAL" and "Change" is unreadable. */}
        <div className="break-inside-avoid">
          <Rule />
          <Row label="Subtotal" value={money(t.subtotal)} />
          {t.discount > 0 && <Row label="Discount" value={"-" + money(t.discount)} />}
          {t.taxMode === "added" ? (
            <>
              <Row label={"Tax " + rate + "%"} value={money(t.tax)} />
              <Row label="TOTAL" value={money(t.total)} strong />
            </>
          ) : (
            <>
              <Row label="TOTAL" value={money(t.total)} strong />
              <Row label={"incl. VAT " + rate + "%"} value={money(t.tax)} />
            </>
          )}
          {t.tip > 0 && (
            <>
              <Row label="Tip" value={money(t.tip)} />
              <Row label="CHARGED" value={money(t.charged)} strong />
            </>
          )}

          <Rule />
          {t.method === "cash" ? (
            <>
              <Row label="Cash" value={money(t.tender)} />
              <Row label="Change" value={money(t.tender - t.total)} />
            </>
          ) : (
            <Row label="Card" value={t.cardBrand + " \u2022\u2022\u2022\u2022 " + t.cardLast4} />
          )}

          <p className="mt-3 text-center font-medium tracking-[0.1em] text-em-dark">P A I D</p>
          <p className="mt-2.5 text-center">Thank you — see you again</p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={"flex justify-between gap-2.5" + (strong ? " text-sm font-medium" : "")}>
      {/* The label may wrap; the amount never does, and never shrinks away. */}
      <span className="min-w-0 break-words">{label}</span>
      <span className="shrink-0 whitespace-nowrap">{value}</span>
    </div>
  );
}

function Rule() {
  return <hr className="my-2.5 border-0 border-t border-dashed border-line-strong" />;
}
