/** Hand-rolled inline SVG — no icon package, and every icon stays tweakable. */
interface IconProps {
  className?: string;
}

export function RegisterIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="2.6" y="5.4" width="14.8" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.6 9.2h14.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.2 12.8h3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BarcodeIcon({ className = "h-[17px] w-[17px]" }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 4.2v9.6M5.6 4.2v9.6M8 4.2v9.6M10.8 4.2v9.6M13 4.2v9.6M15 4.2v9.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="m4.5 6.5 3.5 3.5 3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon({ className = "h-[15px] w-[15px]" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function CashIcon({ className = "h-[17px] w-[17px]" }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={className} aria-hidden="true">
      <rect x="1.8" y="4.5" width="14.4" height="9" rx="1.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="2.1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function CardIcon({ className = "h-[17px] w-[17px]" }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={className} aria-hidden="true">
      <rect x="1.8" y="4.2" width="14.4" height="9.6" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.8 7.6h14.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function TerminalIcon({ className = "h-[26px] w-[26px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9.6h18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function CartIcon({ className = "h-[34px] w-[34px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 5.5h2.3l2 10.2a1.6 1.6 0 0 0 1.6 1.3h7.8a1.6 1.6 0 0 0 1.6-1.2l1.5-6.3H6.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function MinusIcon({ className = "h-3 w-3" }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
      <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className = "h-3 w-3" }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
      <path d="M6 2.5v7M2.5 6h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
