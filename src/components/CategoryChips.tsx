import { useEffect, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_COLOR } from "../data/catalog";

interface Props {
  active: string;
  onChange: (category: string) => void;
}

export function CategoryChips({ active, onChange }: Props) {
  const options: string[] = ["All", ...CATEGORIES];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  /**
   * The edge fades are affordances, not decoration, so each appears only when
   * there is genuinely more to scroll to on that side. Measured from the live
   * DOM for the same reason the segmented control's thumb is.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (track === null) return;
    function measure() {
      const el = trackRef.current;
      if (el === null) return;
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft > 1, end: el.scrollLeft < max - 1 });
    }
    measure();
    track.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      track.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="relative">
      {edges.start && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-mist to-mist/0"
        />
      )}
      {edges.end && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-mist to-mist/0"
        />
      )}
      <div
        ref={trackRef}
        role="group"
        aria-label="Categories"
        className="flex gap-[7px] overflow-x-auto pb-0.5"
      >
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
    </div>
  );
}
