import type { CurrencyCode } from "../types";
import type { HourBucket } from "../lib/sales";
import { formatMoney } from "../lib/money";
import { hourLabel } from "../lib/format";

interface Props {
  buckets: HourBucket[];
  currency: CurrencyCode;
}

const MAX_BAR_PX = 108;

export function HourlyChart({ buckets, currency }: Props) {
  const peak = buckets.reduce((max, b) => (b.amount > max ? b.amount : max), 0);

  return (
    <div className="mt-4 flex h-[136px] items-end gap-[5px]">
      {buckets.map((bucket) => {
        const isPeak = peak > 0 && bucket.amount === peak;
        const height =
          peak === 0 ? 0 : Math.max(3, (bucket.amount / peak) * MAX_BAR_PX);
        return (
          <div
            key={bucket.hour}
            title={
              hourLabel(bucket.hour) +
              (bucket.hour >= 12 ? "pm" : "am") +
              " — " +
              formatMoney(bucket.amount, currency)
            }
            className="flex h-full flex-1 flex-col justify-end gap-1.5"
          >
            <div
              className={
                "min-h-[3px] rounded-t-[5px] " + (isPeak ? "bg-em" : "bg-graphite")
              }
              style={{ height: height + "px" }}
            />
            <div className="text-center text-[10.5px] text-muted-soft">
              {hourLabel(bucket.hour)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
