interface BarItem {
  label: string;
  value: number;
  max: number;
}
interface BarsData {
  items?: BarItem[];
}

export function BarsViz({ data: raw }: { data: Record<string, unknown> }) {
  const data = raw as BarsData;
  const items = data.items ?? [];
  const peak = Math.max(...items.map((i) => i.value), 0);
  return (
    <div className="space-y-2.5">
      {items.map((it) => {
        const pct = it.max > 0 ? (it.value / it.max) * 100 : 0;
        const isPeak = it.value === peak && peak > 0;
        return (
          <div key={it.label} className="flex items-center gap-3">
            <span className="readout w-10 shrink-0 text-right text-xs text-ink-dim">{it.label}</span>
            <div className="h-3 flex-1 bg-[color:var(--surface-line)]">
              <div
                className="h-full transition-[width] duration-[640ms] ease-liquid"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isPeak ? "var(--signal)" : "var(--data-2)",
                }}
              />
            </div>
            <span className="readout w-16 shrink-0 text-xs text-ink-faint">{it.value}</span>
          </div>
        );
      })}
    </div>
  );
}
