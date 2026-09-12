import type { ReactNode } from "react";
import type { Transaction } from "../types";
import { formatMoney } from "../lib/money";
import { formatTime } from "../lib/format";

interface Props {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: Props) {
  const rows = transactions.slice().sort((a, b) => b.no - a.no);

  return (
    <div className="mt-2.5 overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
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
            {rows.map((t) => {
              const units = t.lines.reduce((sum, line) => sum + line.qty, 0);
              return (
                <tr key={t.no} className="hover:bg-surface-alt">
                  <Td className="font-mono">#{t.no}</Td>
                  <Td>{formatTime(t.at)}</Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 text-[13px]">
                      <i
                        aria-hidden="true"
                        className="h-[7px] w-[7px] rounded-sm"
                        style={{
                          backgroundColor: t.method === "card" ? "#15161b" : "#00a870",
                        }}
                      />
                      {t.method === "card" ? "Card •••• " + t.cardLast4 : "Cash"}
                    </span>
                  </Td>
                  <Td>{units}</Td>
                  <Td align="right">
                    {t.discount > 0 ? "-" + formatMoney(t.discount, t.currency) : "—"}
                  </Td>
                  <Td align="right">{formatMoney(t.tax, t.currency)}</Td>
                  <Td align="right">{t.tip > 0 ? formatMoney(t.tip, t.currency) : "—"}</Td>
                  <Td align="right">{formatMoney(t.charged, t.currency)}</Td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted">
                  No sales recorded yet today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
