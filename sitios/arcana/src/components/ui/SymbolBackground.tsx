export function SymbolBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 200"
        className="breathe h-64 w-64 opacity-[0.06]"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      >
        <circle cx="100" cy="100" r="80" />
        <circle cx="100" cy="100" r="40" />
        <line x1="100" y1="20" x2="100" y2="180" />
        <line x1="20" y1="100" x2="180" y2="100" />
        <polygon points="100,30 170,150 30,150" strokeWidth="0.3" />
      </svg>
    </div>
  );
}
