# Benta — notes for AI-assisted sessions

## What this repo is

A point-of-sale demo in JC Policarpio's portfolio, under "Business tools". It
is the second framework build after Bodega (inventory), and the two are
companions: same five product categories, same fictional store, so a sale can
later decrement real stock. Its other job is to read as **international** —
foreign clients must see their own market in it.

Live: https://my-portfolio-jcp.vercel.app links to the deployed app.
Companion: https://bodega-jcpoli.vercel.app (repo: JcPoli/bodega-inventory)

## Non-negotiables

- **Money is integer minor units.** Never a float, never a formatted string in
  state. Format only at the edge via `lib/money.ts`.
- **Currency is a store setting**, not a conversion. Switching re-labels and
  re-denominates; it does not apply an FX rate. JPY's zero decimals must keep
  working — it is the test case that catches regressions.
- **Tax has two modes**, added and included. Any new money surface must respect
  both, including receipt wording.
- **Transactions snapshot their context** (currency, taxMode, taxRate). Never
  recompute a past sale from current settings.
- Persistence stays isolated in `src/hooks/useStore.ts` (localStorage, key
  `benta.pos.v1`). The Supabase migration replaces only that layer; the action
  API (`addProduct`, `adjust`, `remove`, `setDiscount`, `clearOrder`,
  `holdOrder`, `resumeOrder`, `discardHeld`, `completeSale`, `patchSettings`,
  `resetDemo`) must stay stable.
- Domain logic is pure and lives in `src/lib`; components stay thin.

## Stack and conventions

- React 19 + TypeScript strict + Vite. Keep `noUnusedLocals` and
  `noUnusedParameters` on. Build is `tsc --noEmit && vite build`.
- **Tailwind CSS v3 through PostCSS.** Tokens live in `tailwind.config.js`
  under `theme.extend`; `src/index.css` holds the `@tailwind` directives, base
  styles, and the print rules. Do not "upgrade" to v4: its Rust engine
  (`@tailwindcss/oxide`) requires Node 20+ and the dev machine runs Node 18.
- v3 traps to respect: a bare `border` defaults to gray-200, so **always pair
  it with an explicit colour class**; and class names must appear as **complete
  literal strings** in the source — never concatenate fragments. Category
  colours are therefore hex values in `data/catalog.ts` applied as inline
  styles, not generated class names.
- No runtime dependencies beyond react/react-dom. No UI kits, no icon
  packages, no chart libraries. Icons live in `components/Icons.tsx`; the
  donut and bars are hand-written SVG/CSS.
- Motion only answers a user action (the payment sheet slides in). Nothing
  animates on load. `prefers-reduced-motion` is honoured.

## Design identity (do not homogenise with the other demos)

The portfolio's rule: every demo differs in BOTH palette and layout skeleton,
and MyPortfolio's `docs/BACKLOG.md` lists nine banned "same template"
patterns. This repo avoids all of them.

Benta's identity: cool-mist canvas (`bg-mist`), elevated white surfaces,
graphite ink, one emerald accent for money actions only, red functional only.
Plus Jakarta Sans; JetBrains Mono restricted to SKUs and receipts. Sentence
case, no all-caps labels. Skeleton: command bar + product canvas + floating
order card. **No sidebar** — that is Bodega's shape, not this one.

## Environment gotchas

- Dev machine runs **Node 18.17.1** on Windows, repo at `C:\dev\benta-pos`.
- Windows and WSL share the folder. If an agent runs npm inside WSL,
  `node_modules` becomes Linux-flavoured and Windows dev breaks with
  "Cannot find module @rollup/rollup-win32-x64-msvc". Fix from PowerShell:
  `Remove-Item -Recurse -Force node_modules; npm install`. Prefer not running
  npm install in WSL at all.
- Git identity must be `JcPoli / jcpolicarpio0905@gmail.com`, set per repo.
  A company-email commit makes Vercel refuse the deployment
  ("commit email could not be matched to a GitHub account"); fix with
  `git commit --amend --reset-author --no-edit && git push --force`.
  Cherry-picks preserve the original author, so amend afterwards.
- Vercel deploys on **push**, not commit. A failed build leaves the previous
  version live.

## Honest demo framing

The order panel carries "Demo mode: orders stay in this browser. Production
adds Supabase for shared records, multiple registers, and staff accounts."
Keep that honesty — do not fake auth, staff accounts, or a real card charge.
The card terminal is explicitly labelled as simulated.
