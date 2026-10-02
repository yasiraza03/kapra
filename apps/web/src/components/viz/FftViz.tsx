interface FftData {
  image?: string;
  periodicityPx?: number;
  orientationDeg?: number;
}

export function FftViz({ data: raw }: { data: Record<string, unknown> }) {
  const data = raw as FftData;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative aspect-square w-full max-w-[220px] overflow-hidden border border-line">
        {data.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.image} alt="2D Fourier power spectrum" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-faint">no spectrum</div>
        )}
        {/* crosshair: the spectrum is centered on DC */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-[color:var(--surface-line)]" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-[color:var(--surface-line)]" />
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:block sm:space-y-2">
        <Readout label="repeat" value={data.periodicityPx != null ? `${data.periodicityPx}px` : "—"} />
        <Readout label="orientation" value={data.orientationDeg != null ? `${data.orientationDeg}°` : "—"} />
      </dl>
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="readout text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint">{label}</dt>
      <dd className="readout text-lg text-ink">{value}</dd>
    </div>
  );
}
