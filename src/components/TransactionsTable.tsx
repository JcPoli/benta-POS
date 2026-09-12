import type { ReactNode } from "react";
import type { Transaction } from "../types";
import { formatMoney } from "../lib/money";
import { unitsOf } from "../lib/order";
import { formatTime, pluralize } from "../lib/format";
import { METHOD_COLOR } from "../data/catalog";

interface Props {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: Props) {
  const rows = transactions.slice().sort((a, b) => b.no - a.no);

  if (rows.length === 0) {
    return (
      <div className="mt-2.5 rounded-2xl border border-line bg-surface px-4 py-10 text-center text-muted shadow-soft">
        No sales recorded yet today.
      </div>
    );
  }

  return (
    <>
      {/* Below sm the eight columns become a stacked card each: a phone should
          not be handed a sideways scrollbar. Same rows, same order. */}
      <div className="mt-2.5 overflow-hidden rounded-2xl border border-line bg-surface shadow-soft sm:hidden">
        {rows.map((t) => (
          <div key={t.no} className="border-b border-line px-4 py-3 last:border-b-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[13px]">#{t.no}</span>
              <span className="text-[17px] font-bold tnum">
                {formatMoney(t.charged, t.currency)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-[12.5px] text-muted">
              <MethodTag transaction={t} />
              <span className="tnum">{formatTime(t.at)}</span>
            </div>
            <p className="mt-1 text-[12.5px] text-muted tnum">
              {pluralize(unitsOf(t.lines), "item", "items")} · tax{" "}
              {formatMoney(t.tax, t.currency)}
              {t.discount > 0 && " · discount -" + formatMoney(t.discount, t.currency)}
              {t.tip > 0 && " · tip " + formatMoney(t.tip, t.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-2.5 hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-soft sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Time</Th>
                <Th>Method</Th>
                <Th>Items</Th>
                <Th align="right">Discount</Th>
                <Th align="right">Tax</Th>
                <Th align="right">Tip</Th>
                <Th align="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.no} className="hover:bg-surface-alt">
                  <Td className="font-mono">#{t.no}</Td>
                  <Td>{formatTime(t.at)}</Td>
                  <Td>
                    <MethodTag transaction={t} />
                  </Td>
                  <Td>{unitsOf(t.lines)}</Td>
                  <Td align="right">
                    {t.discount > 0 ? "-" + formatMoney(t.discount, t.currency) : "—"}
                  </Td>
                  <Td align="right">{formatMoney(t.tax, t.currency)}</Td>
                  <Td align="right">{t.tip > 0 ? formatMoney(t.tip, t.currency) : "—"}</Td>
                  <Td align="right">{formatMoney(t.charged, t.currency)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/** One reading of the method, so the table and the cards cannot drift apart. */
function MethodTag({ transaction }: { transaction: Transaction }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px]">
      <i
        aria-hidden="true"
        className="h-[7px] w-[7px] shrink-0 rounded-sm"
        style={{ backgroundColor: METHOD_COLOR[transaction.method] }}
      />
      {transaction.method === "card" ? "Card •••• " + transaction.cardLast4 : "Cash"}
    </span>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={
        "whitespace-nowrap border-b border-line bg-surface-alt px-4 py-[11px] text-[12.5px] font-semibold text-muted " +
        (align === "right" ? "text-right" : "text-left")
      }
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={
        "whitespace-nowrap border-b border-line px-4 py-[11px] last:border-b-0 " +
        (align === "right" ? "text-right tnum " : "") +
        className
      }
    >
      {children}
    </td>
  );
}
