interface HistogramData {
  label?: string;
  bins?: number[];
}

export function HistogramViz({ data: raw }: { data: Record<string, unknown> }) {
  const data = raw as HistogramData;
  const bins = data.bins ?? [];
  const max = Math.max(...bins, 1e-9);
  return (
    <div className="space-y-2">
      <div className="flex h-28 items-end gap-px">
        {bins.map((v, i) => {
          const h = (v / max) * 100;
          // tint across the data spectrum by position
          const t = bins.length > 1 ? i / (bins.length - 1) : 0;
          return (
            <div
              key={i}
              className="flex-1 transition-[height] duration-[640ms] ease-liquid"
              style={{
                height: `${Math.max(h, 1)}%`,
                backgroundColor: `color-mix(in srgb, var(--data-2) ${(1 - t) * 100}%, var(--data-5))`,
              }}
              title={v.toExponential(2)}
            />
          );
        })}
      </div>
      {data.label && (
        <p className="readout text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint">
          {data.label}
        </p>
      )}
    </div>
  );
}
