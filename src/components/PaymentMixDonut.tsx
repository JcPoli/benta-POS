import type { CurrencyCode } from "../types";
import { formatMoney } from "../lib/money";
import { METHOD_COLOR } from "../data/catalog";

interface Props {
  cash: number;
  card: number;
  currency: CurrencyCode;
}

/** Hand-rolled SVG donut — no chart library, and the arcs always sum to 100%. */
const RADIUS = 15.9155;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PaymentMixDonut({ cash, card, currency }: Props) {
  const total = cash + card;
  const cardFraction = total === 0 ? 0 : card / total;

  return (
    <div className="mt-3.5 flex items-center gap-[18px]">
      <svg viewBox="0 0 42 42" className="h-32 w-32 shrink-0" aria-hidden="true">
        {total === 0 ? (
          <Arc color="#e6e8ee" fraction={1} offset={0} />
        ) : (
          <>
            <Arc color={METHOD_COLOR.card} fraction={cardFraction} offset={0} />
            <Arc
              color={METHOD_COLOR.cash}
              fraction={1 - cardFraction}
              offset={cardFraction}
            />
          </>
        )}
      </svg>
      <div className="flex flex-col gap-2.5 text-[13.5px]">
        <LegendRow
          label="Card"
          amount={card}
          total={total}
          color={METHOD_COLOR.card}
          currency={currency}
        />
        <LegendRow
          label="Cash"
          amount={cash}
          total={total}
          color={METHOD_COLOR.cash}
          currency={currency}
        />
      </div>
    </div>
  );
}

function Arc({
  color,
  fraction,
  offset,
}: {
  color: string;
  fraction: number;
  offset: number;
}) {
  return (
    <circle
      cx="21"
      cy="21"
      r={RADIUS}
      fill="none"
      stroke={color}
      strokeWidth="5.2"
      strokeLinecap="butt"
      strokeDasharray={
        (CIRCUMFERENCE * fraction).toFixed(3) +
        " " +
        (CIRCUMFERENCE * (1 - fraction)).toFixed(3)
      }
      strokeDashoffset={(CIRCUMFERENCE * (0.25 - offset)).toFixed(3)}
    />
  );
}

function LegendRow({
  label,
  amount,
  total,
  color,
  currency,
}: {
  label: string;
  amount: number;
  total: number;
  color: string;
  currency: CurrencyCode;
}) {
  const share = total === 0 ? 0 : Math.round((amount / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <i
        aria-hidden="true"
        className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
        style={{ backgroundColor: color }}
      />
      <b className="font-bold tnum">{formatMoney(amount, currency)}</b>
      <span className="text-muted">
        {label} · {share}%
      </span>
    </div>
  );
}
