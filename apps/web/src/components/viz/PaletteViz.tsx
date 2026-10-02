interface Swatch {
  hex: string;
  rgb?: number[];
  lab?: number[];
  proportion: number;
}
interface PaletteData {
  swatches?: Swatch[];
  deltaE2000Mean?: number;
  evenness?: number;
}

export function PaletteViz({ data: raw }: { data: Record<string, unknown> }) {
  const data = raw as PaletteData;
  const swatches = data.swatches ?? [];
  const evenness = data.evenness ?? 0;
  return (
    <div className="space-y-4">
      {/* proportional color bar */}
      <div className="flex h-16 w-full overflow-hidden border border-line">
        {swatches.map((s, i) => (
          <div
            key={`${s.hex}-${i}`}
            style={{ backgroundColor: s.hex, width: `${Math.max(s.proportion * 100, 2)}%` }}
            title={`${s.hex} · ${(s.proportion * 100).toFixed(1)}%`}
          />
        ))}
      </div>

      {/* swatch readouts */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {swatches.map((s, i) => (
          <div key={`${s.hex}-leg-${i}`} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 border border-line"
              style={{ backgroundColor: s.hex }}
            />
            <span className="readout text-xs text-ink-dim">{s.hex}</span>
            <span className="readout text-xs text-ink-faint">
              {(s.proportion * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {/* dye evenness meter */}
      <div className="flex items-center gap-3 pt-1">
        <span className="readout text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint">
          dye evenness
        </span>
        <div className="h-2 w-40 bg-[color:var(--surface-line)]">
          <div
            className="h-full transition-[width] duration-[640ms] ease-liquid"
            style={{ width: `${evenness * 100}%`, backgroundColor: "var(--tier-measured)" }}
          />
        </div>
        <span className="readout text-xs text-ink">{(evenness * 100).toFixed(0)}%</span>
        {data.deltaE2000Mean != null && (
          <span className="readout text-xs text-ink-faint">
            mean &Delta;E {data.deltaE2000Mean}
          </span>
        )}
      </div>
    </div>
  );
}
