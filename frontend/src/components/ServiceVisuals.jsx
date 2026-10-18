export function CardVisual({ children }) {
  return (
    <div className="relative grid h-60 place-items-center overflow-hidden bg-mist [background-image:radial-gradient(#d6d6d6_1px,transparent_1px)] [background-size:18px_18px]">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-mint/20 blur-2xl" />
      <div className="relative transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
        {children}
      </div>
    </div>
  );
}

export const CodeWindow = () => (
  <div className="w-56 rounded-xl bg-paper p-3 shadow-lg ring-1 ring-black/5">
    <div className="mb-3 flex gap-1.5">
      <i className="h-2 w-2 rounded-full bg-accent" />
      <i className="h-2 w-2 rounded-full bg-mint" />
      <i className="h-2 w-2 rounded-full bg-cobalt" />
    </div>
    <div className="space-y-2">
      <div className="h-2 w-3/4 rounded bg-cobalt/70" />
      <div className="ml-4 h-2 w-1/2 rounded bg-mint/60" />
      <div className="ml-4 h-2 w-2/3 rounded bg-accent/70" />
      <div className="h-2 w-1/3 rounded bg-cobalt/30" />
    </div>
  </div>
);

export const NetworkNodes = () => (
  <svg width="220" height="130" viewBox="0 0 200 120" fill="none" aria-hidden="true">
    {[[30, 28], [170, 28], [38, 96], [165, 96]].map(([x, y]) => (
      <g key={x}>
        <line x1="100" y1="60" x2={x} y2={y} className="stroke-cobalt/40" strokeWidth="2" />
        <circle cx={x} cy={y} r="9" className="fill-paper stroke-cobalt" strokeWidth="2.5" />
      </g>
    ))}
    <circle cx="100" cy="60" r="16" className="fill-cobalt" />
    <circle cx="100" cy="60" r="24" className="animate-pulse stroke-mint/60" strokeWidth="2" />
  </svg>
);

export const ServerRack = () => (
  <div className="w-52 space-y-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="flex items-center justify-between rounded-lg bg-paper px-3 py-2.5 shadow ring-1 ring-black/5"
      >
        <div className="h-2 w-20 rounded bg-ink/15" />
        <div className="flex gap-1.5">
          <i className="h-2 w-2 rounded-full bg-mint" />
          <i className={`h-2 w-2 rounded-full ${i === 1 ? 'bg-accent' : 'bg-cobalt'}`} />
        </div>
      </div>
    ))}
  </div>
);

export const DataChart = () => (
  <div className="flex h-28 w-52 items-end gap-2 rounded-xl bg-paper p-3 shadow-lg ring-1 ring-black/5">
    {[35, 55, 40, 75, 60, 95].map((h, i) => (
      <div
        key={i}
        style={{ height: `${h}%` }}
        className={`flex-1 rounded-t ${i === 5 ? 'bg-accent' : 'bg-cobalt/60'}`}
      />
    ))}
  </div>
);

export const GrowthLine = () => (
  <svg width="220" height="130" viewBox="0 0 200 120" fill="none" aria-hidden="true">
    <rect x="10" y="10" width="180" height="100" rx="12" className="fill-paper stroke-black/5" />
    <polyline
      points="25,90 60,70 90,78 125,45 170,25"
      className="stroke-accent"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="170" cy="25" r="6" className="fill-accent" />
    <circle cx="170" cy="25" r="12" className="animate-pulse stroke-accent/40" strokeWidth="2" />
  </svg>
);
export function pickVisual(title = '') {
  const t = title.toLowerCase();
  if (/market|seo|ads|social|campaign/.test(t)) return GrowthLine;
  if (/hardware|router|switch|cctv|device/.test(t)) return ServerRack;
  if (/network|wifi|wi-fi/.test(t)) return NetworkNodes;
  if (/data|\bai\b|analytic|machine/.test(t)) return DataChart;
  return CodeWindow;
}