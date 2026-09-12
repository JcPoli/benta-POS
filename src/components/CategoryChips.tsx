import { CATEGORIES, CATEGORY_COLOR } from "../data/catalog";

interface Props {
  active: string;
  onChange: (category: string) => void;
}

export function CategoryChips({ active, onChange }: Props) {
  const options: string[] = ["All", ...CATEGORIES];

  return (
    <div role="group" aria-label="Categories" className="flex gap-[7px] overflow-x-auto pb-0.5">
      {options.map((name) => {
        const selected = active === name;
        return (
          <button
            key={name}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(name)}
            className={
              "inline-flex shrink-0 items-center gap-[7px] rounded-[10px] border px-[13px] py-2 text-[13.5px] font-semibold " +
              (selected
                ? "border-graphite bg-graphite text-white"
                : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink")
            }
          >
            {name !== "All" && (
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-[3px]"
                style={{
                  backgroundColor:
                    CATEGORY_COLOR[name as keyof typeof CATEGORY_COLOR],
                }}
              />
            )}
            {name}
          </button>
        );
      })}
    </div>
  );
}
