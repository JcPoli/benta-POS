import { useMemo } from "react";
import type { ReactNode } from "react";
import type { Settings, Transaction } from "../types";
import { byHour, summarize, taxByCategory, topProducts } from "../lib/sales";
import { formatMoney } from "../lib/money";
import { taxLabel } from "../lib/tax";
import { pluralize } from "../lib/format";
import { csvFilename, downloadCsv, transactionsToCsv } from "../lib/csv";
import { CATEGORY_COLOR } from "../data/catalog";
import { HourlyChart } from "./HourlyChart";
import { PaymentMixDonut } from "./PaymentMixDonut";
import { RankedList } from "./RankedList";
import type { RankedRow } from "./RankedList";
import { TransactionsTable } from "./TransactionsTable";

interface Props {
  transactions: Transaction[];
  settings: Settings;
  onReset: () => void;
}

export function SalesView({ transactions, settings, onReset }: Props) {
  const currency = settings.currency;

  const summary = useMemo(() => summarize(transactions), [transactions]);
  const hours = useMemo(() => byHour(transactions), [transactions]);
  const products = useMemo(() => topProducts(transactions, 6), [transactions]);
  const taxRows = useMemo(() => taxByCategory(transactions), [transactions]);

  /**
   * Currency is a store setting, so a day's history can in principle span a
   * change. Each row formats in its own recorded currency; this flag lets the
   * page say so rather than quietly mixing units in the totals.
   */
  const mixedCurrency = transactions.some((t) => t.currency !== currency);

  const productRows: RankedRow[] = useMemo(() => {
    const max = products.length === 0 ? 1 : products[0]?.amount ?? 1;
    return products.map((p) => ({
      key: p.sku,
      label: p.name,
      value: formatMoney(p.amount, currency),
      sub: pluralize(p.qty, "unit", "units"),
      weight: max === 0 ? 0 : p.amount / max,
      color: CATEGORY_COLOR[p.category],
    }));
  }, [products, currency]);

  const taxListRows: RankedRow[] = useMemo(() => {
    const max = taxRows.length === 0 ? 1 : taxRows[0]?.tax ?? 1;
    return taxRows.map((row) => ({
      key: row.category,
      label: row.category,
      value: formatMoney(Math.round(row.tax), currency),
      sub: "on " + formatMoney(Math.round(row.net), currency),
      weight: max === 0 ? 0 : row.tax / max,
      color: CATEGORY_COLOR[row.category],
    }));
  }, [taxRows, currency]);

  const kpis = [
    { label: "Gross takings", value: formatMoney(summary.gross, currency), sub: "after discounts" },
    {
      label: "Net of tax",
      value: formatMoney(summary.netOfTax, currency),
      sub: settings.taxMode === "added" ? "excluding tax added" : "excluding VAT",
    },
    { label: "Transactions", value: String(summary.count), sub: "today" },
    { label: "Average sale", value: formatMoney(summary.average, currency), sub: "per transaction" },
    { label: "Tips", value: formatMoney(summary.tips, currency), sub: "card payments only" },
  ];

  function exportCsv() {
    downloadCsv(csvFilename("benta-sales"), transactionsToCsv(transactions));
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-9 pt-[18px] sm:px-[18px]">
      <div className="mx-auto max-w-[1160px]">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">Sales today</h1>
        <p className="text-sm text-muted">
          {pluralize(summary.count, "transaction", "transactions")},{" "}
          {summary.units} items sold
          {mixedCurrency && " — some earlier sales were recorded in another currency"}
        </p>

        <section
          aria-label="Day summary"
          className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(186px,1fr))] gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-soft"
        >
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-surface px-[17px] py-[15px]">
              <p className="text-[13px] text-muted">{kpi.label}</p>
              <p className="mt-[3px] text-[25px] font-extrabold tracking-[-0.025em] tnum">
                {kpi.value}
              </p>
              <p className="text-xs text-muted">{kpi.sub}</p>
            </div>
          ))}
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Panel title="Sales by hour" sub="Trading hours, 7am to 8pm">
            <HourlyChart buckets={hours} currency={currency} />
          </Panel>
          <Panel title="Payment mix" sub="Share of takings by method">
            <PaymentMixDonut cash={summary.cash} card={summary.card} currency={currency} />
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Panel title="Top products" sub="By revenue today">
            <RankedList rows={productRows} emptyLabel="No sales recorded yet today." />
          </Panel>
          <Panel
            title="Tax collected"
            sub={taxLabel(settings) + " — " + formatMoney(summary.tax, currency) + " today"}
          >
            <RankedList rows={taxListRows} emptyLabel="Nothing collected yet today." />
          </Panel>
        </div>

        <div className="mt-[22px] flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-bold">Transactions</h2>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-[10px] border border-line bg-surface px-3.5 py-2 text-[13.5px] font-semibold shadow-soft hover:border-line-strong"
          >
            Export CSV
          </button>
        </div>
        <TransactionsTable transactions={transactions} />

        <footer className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-4 text-[12.5px] leading-relaxed text-muted">
          <p className="flex-1 min-w-[260px]">
            Demo mode: this day is seeded sample data and lives in your browser.
            Money is held in integer minor units, currency is a store setting,
            and each sale records the tax context it was rung up under.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="font-semibold underline underline-offset-2 hover:text-ink"
          >
            Reset demo data
          </button>
        </footer>
      </div>
    </div>
  );
}

function Panel({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-[17px] shadow-soft">
      <h2 className="text-[15px] font-bold">{title}</h2>
      <p className="text-[12.5px] text-muted">{sub}</p>
      {children}
    </section>
  );
}
