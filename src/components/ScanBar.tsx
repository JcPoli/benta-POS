import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { BarcodeIcon } from "./Icons";

/**
 * A refused scan, shown under the field. The id changes on every notice so the
 * same message twice still reads as two answers.
 */
export interface ScanNotice {
  id: number;
  text: string;
}

interface Props {
  query: string;
  onQuery: (value: string) => void;
  /** Fired when a scanner (or the operator) presses Enter. */
  onSubmit: (code: string) => void;
  notice: ScanNotice | null;
}

export function ScanBar({ query, onQuery, onSubmit, notice }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // "/" focuses the field, the way a till operator expects.
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key !== "/") return;
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    onSubmit(query);
  }

  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
          <BarcodeIcon />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          autoComplete="off"
          aria-label="Scan or search products"
          placeholder="Scan barcode, or search name and SKU"
          onChange={(event) => onQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-[13px] border border-line bg-surface py-3 pl-10 pr-14 text-[14.5px] shadow-soft placeholder:text-muted-soft hover:border-line-strong focus:border-line-strong"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-[5px] border border-line-strong bg-surface-alt px-[5px] py-px text-[11px] font-semibold text-muted">
          /
        </span>
      </div>

      {/* The region stays mounted so a change inside it is announced; the keyed
          child is what replays the fade. Empty, it takes no height. */}
      <div role="status">
        {notice !== null && (
          <p
            key={notice.id}
            className="mt-2 animate-fade-in rounded-[10px] border border-danger-ring bg-danger-soft px-3 py-2 text-[13px] font-medium text-danger motion-reduce:animate-none"
          >
            {notice.text}
          </p>
        )}
      </div>
    </div>
  );
}
