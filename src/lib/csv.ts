import type { Transaction } from "../types";
import { plainAmount } from "./money";
import { formatTime } from "./format";

function escapeCell(value: string | number): string {
  const s = String(value);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

const HEADERS = [
  "Order", "Time", "Method", "Items", "Subtotal", "Discount",
  "Tax", "Total", "Tip", "Charged", "Currency", "Tax mode", "Tax rate %",
];

/**
 * Each row carries its own currency and tax context, so a spreadsheet stays
 * meaningful even if the store settings change later.
 * A UTF-8 BOM keeps Excel from mangling currency symbols.
 */
export function transactionsToCsv(txs: Transaction[]): string {
  const rows = txs
    .slice()
    .sort((a, b) => a.no - b.no)
    .map((t) => {
      const units = t.lines.reduce((s, l) => s + l.qty, 0);
      return [
        t.no,
        formatTime(t.at),
        t.method === "card" ? "Card ****" + t.cardLast4 : "Cash",
        units,
        plainAmount(t.subtotal, t.currency),
        plainAmount(t.discount, t.currency),
        plainAmount(t.tax, t.currency),
        plainAmount(t.total, t.currency),
        plainAmount(t.tip, t.currency),
        plainAmount(t.charged, t.currency),
        t.currency,
        t.taxMode,
        t.taxRate,
      ];
    });
  return (
    "\uFEFF" +
    [HEADERS]
      .concat(rows.map((r) => r.map(String)))
      .map((r) => r.map(escapeCell).join(","))
      .join("\r\n")
  );
}

export function csvFilename(prefix: string): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return prefix + "-" + d.getFullYear() + "-" + month + "-" + day + ".csv";
}

export function downloadCsv(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
