interface Row {
  key: string;
  label: string;
  value: string;
  sub: string;
  /** Bar weight, 0 to 1. */
  weight: number;
  color: string;
}

interface Props {
  rows: Row[];
  emptyLabel: string;
}

/** Shared ranked bar list — used by top products and tax by category. */
export function RankedList({ rows, emptyLabel }: Props) {
  if (rows.length === 0) {
    return <p className="mt-3 text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="mt-3">
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-[3px] border-b border-line py-2.5 last:border-b-0"
        >
          <span className="text-sm font-semibold">{row.label}</span>
          <span className="text-right font-bold tnum">{row.value}</span>
          <span className="text-[12.5px] text-muted tnum">{row.sub}</span>
          <span />
          <span className="col-span-2 h-1 overflow-hidden rounded-full bg-surface-alt">
            <i
              className="block h-full rounded-full"
              style={{
                width: Math.max(2, row.weight * 100) + "%",
                backgroundColor: row.color,
              }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export type { Row as RankedRow };
