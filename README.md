# Benta — point of sale

A working register for any small retailer: scan or tap to build an order, take
cash or card, print a receipt, and read the day back. Built to be recognisable
to a shop owner anywhere, not just in one market.

Demo build — no sign-in, data lives in the browser. The production version adds
Supabase (Postgres, Auth, row-level security) behind the same state API.

Part of [JC Policarpio's](https://my-portfolio-jcp.vercel.app) portfolio, and a
companion to the [Bodega](https://bodega-jcpoli.vercel.app) inventory console:
same five product categories, same fictional store, so a sale can later
decrement real stock.

## Built for international use

- **Currency is a store setting** — USD, EUR, GBP, AED, JPY. Symbol placement,
  thousands and decimal separators, cash denominations and the *number of
  decimals* all follow it. JPY has none, which is the case naive money code
  gets wrong.
- **Tax works either way** — added on top at checkout (US sales tax) or already
  inside the shelf price (EU/UK/Gulf VAT). The rate is editable; the receipt
  wording, the order summary and the day's reports all follow the mode.
- **Money is never a float.** Every amount is an integer in the currency's
  minor unit; formatting happens only at the edge.
- **Each sale records its own context.** Currency, tax mode and rate are frozen
  onto the transaction, so changing a store setting tomorrow cannot rewrite
  yesterday's takings.

## Features

- Product grid with category filter, live stock, and an order-quantity badge
- Barcode field that accepts a scanner's Enter, plus `/` to focus it
- Order panel: quantity steppers, void, percentage or fixed discount, live totals
- Hold and resume orders, so one customer never blocks the next
- Cash: tender pad with currency-aware quick-cash notes and live change
- Card: tip presets with amounts, simulated terminal, authorisation code
- Print-ready receipt (browser print shows only the receipt)
- Sales day view: gross, net of tax, average sale, tips, sales by hour,
  payment-mix donut, top products, tax collected by category
- CSV export carrying currency and tax context per row, UTF-8 BOM for Excel
- Keyboard and screen-reader affordances, reduced-motion support

## Stack

React 19, TypeScript (strict), Vite, Tailwind CSS v3 via PostCSS. No runtime
dependencies beyond React — no UI kit, no icon package, no chart library. The
donut, bars and icons are hand-rolled SVG.

The toolchain is deliberately pure JavaScript: Tailwind v3 has no native
binary, so it installs cleanly on Node 18 as well as current LTS. (Tailwind
v4's Rust engine needs Node 20+.)

## Getting started

Requires Node 18 or newer.

```bash
npm install
npm run dev
```

Other scripts: `npm run typecheck`, `npm run build` (typechecks first),
`npm run preview`.

Commit `package-lock.json` after the first install — the deploy workflow uses
`npm ci`.

## Deploying

**Vercel (recommended, zero config):** import the repo at vercel.com/new. Vite
is auto-detected; every push to `main` deploys.

**GitHub Pages:** Settings → Pages → Source "GitHub Actions", then run the
included **Deploy to GitHub Pages** workflow from the Actions tab. It passes
`--base=/<repo>/` automatically, so no config changes are needed.

## Project structure

```
src/
  App.tsx                    shell: view state, scan handling, payment flow
  main.tsx                   entry point
  index.css                  Tailwind directives, base styles, print rules
  types.ts                   Currency, Settings, Product, OrderLine, Transaction
  data/
    catalog.ts               products, category colours, store details
    seed.ts                  default settings and a seeded trading day
  hooks/useStore.ts          reducer + localStorage (Supabase swaps in here)
  lib/
    money.ts                 currency table, format, parse, minor units
    tax.ts                   added vs included tax, labels, rate parsing
    order.ts                 lines, stock ceilings, totals, search, scanning
    sales.ts                 day summary, hourly buckets, rankings, tax split
    format.ts                time, date, hour labels, pluralisation
    csv.ts                   export with per-row currency and tax context
  components/
    CommandBar.tsx           brand, view switch, held, currency, tax
    Segmented.tsx            view switch with a measured sliding thumb
    ScanBar.tsx              barcode/search field with the "/" shortcut
    CategoryChips.tsx        category filter with colour keys
    ProductGrid.tsx          tappable product tiles
    OrderPanel.tsx           order lines, steppers, totals, pay
    PaymentSheet.tsx         method switch, tender pad, card flow
    Receipt.tsx              printable receipt, tax wording by mode
    Popovers.tsx             held orders, tax settings
    SalesView.tsx            day view layout and KPIs
    HourlyChart.tsx          sales by hour
    PaymentMixDonut.tsx      cash vs card donut
    RankedList.tsx           shared ranked bar list
    TransactionsTable.tsx    transaction log
```

## Design notes

Cool-mist canvas, elevated white surfaces, graphite ink, and a single emerald
accent reserved for money actions; red is functional only. Plus Jakarta Sans
throughout, JetBrains Mono for SKUs and receipts. No sidebar — the register is
the screen, which is the shape a till actually needs. The visual system and
layout skeleton are deliberately distinct from every other demo in the
portfolio.

## Roadmap

- Supabase Postgres for shared sales across registers
- Staff accounts and per-register reporting
- Refunds and partial returns
- Split payments across methods
- Decrementing Bodega's inventory on every sale
