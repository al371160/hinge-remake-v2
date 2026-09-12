/** Default iPhone status glyphs — filled bars, fan Wi‑Fi, capsule battery. */
export function IosStatusIcons() {
  return (
    <span className="flex items-center gap-[6px] text-ink" aria-hidden>
      <CellularBars />
      <WifiFan />
      <BatteryPill />
    </span>
  )
}

function CellularBars() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
      <rect x="0" y="7.6" width="3.4" height="4.4" rx="0.9" />
      <rect x="4.8" y="5.2" width="3.4" height="6.8" rx="0.9" />
      <rect x="9.6" y="2.6" width="3.4" height="9.4" rx="0.9" />
      <rect x="14.4" y="0" width="3.4" height="12" rx="0.9" />
    </svg>
  )
}

function WifiFan() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <path d="M8 .15A11.2 11.2 0 0 1 15.72 3.3L14.2 4.82A9.05 9.05 0 0 0 8 2.35 9.05 9.05 0 0 0 1.8 4.82L.28 3.3A11.2 11.2 0 0 1 8 .15Z" />
      <path d="M8 3.85a7.05 7.05 0 0 1 4.86 1.94L11.34 7.3A4.9 4.9 0 0 0 8 5.95 4.9 4.9 0 0 0 4.66 7.3L3.14 5.79A7.05 7.05 0 0 1 8 3.85Z" />
      <path d="M8 7.45c.9 0 1.72.34 2.34.9L8 10.7 5.66 8.35A3.2 3.2 0 0 1 8 7.45Z" />
    </svg>
  )
}

function BatteryPill() {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13">
      <rect
        x="0.65"
        y="0.65"
        width="22.2"
        height="11.7"
        rx="3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect x="2.2" y="2.2" width="19.1" height="8.6" rx="2" fill="currentColor" />
      <rect x="24.4" y="4.35" width="1.7" height="4.3" rx="0.85" fill="currentColor" />
    </svg>
  )
}
