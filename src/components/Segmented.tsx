import { useEffect, useRef, useState } from "react";
import type { View } from "../types";

interface Props {
  view: View;
  onChange: (view: View) => void;
}

const OPTIONS: { value: View; label: string }[] = [
  { value: "register", label: "Register" },
  { value: "sales", label: "Sales" },
];

/**
 * Segmented control with a thumb that slides to the active option. The thumb
 * is measured from the live DOM so it stays correct at any font size.
 */
export function Segmented({ view, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [thumb, setThumb] = useState({ left: 0, width: 0 });

  useEffect(() => {
    function measure() {
      const track = trackRef.current;
      if (track === null) return;
      const active = track.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      if (active === null) return;
      setThumb({ left: active.offsetLeft - 3, width: active.offsetWidth });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [view]);

  return (
    <div
      ref={trackRef}
      role="group"
      aria-label="Views"
      className="relative flex rounded-xl border border-line bg-surface-alt p-[3px]"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-[3px] top-[3px] rounded-lg bg-surface shadow-soft transition-[transform,width] duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: "translateX(" + thumb.left + "px)", width: thumb.width }}
      />
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={view === option.value}
          onClick={() => onChange(option.value)}
          className={
            "relative z-10 rounded-lg px-[15px] py-1.5 text-sm font-semibold " +
            (view === option.value ? "text-ink" : "text-muted hover:text-ink")
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
