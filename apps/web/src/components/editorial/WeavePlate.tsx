/**
 * Procedural textile plates. Each variant draws an actual weave structure
 * (or a frequency-space figure), so the imagery is never merely decorative —
 * it's the thing the instrument reads.
 */

export type PlateVariant = "plain" | "twill" | "satin" | "spectrum" | "rib";

export function WeavePlate({
  variant = "twill",
  className = "",
  label,
}: {
  // `| undefined` is explicit because the repo runs exactOptionalPropertyTypes,
  // and these are forwarded from optional content fields.
  variant?: PlateVariant | undefined;
  className?: string | undefined;
  label?: string | undefined;
}) {
  const uid = `plate-${variant}`;
  return (
    <div className={`relative overflow-hidden bg-surface-sunken ${className}`}>
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label={label ?? `${variant} weave structure`}
      >
        <defs>{patternFor(variant, uid)}</defs>
        <rect width="200" height="200" fill={`url(#${uid})`} />
      </svg>
      {label && (
        <span className="readout absolute bottom-3 left-3 bg-surface/85 px-2 py-1 text-[0.625rem] uppercase tracking-[0.2em] text-ink-dim">
          {label}
        </span>
      )}
    </div>
  );
}

function patternFor(variant: PlateVariant, id: string) {
  const ink = "var(--ink)";
  const faint = "var(--surface-line)";

  switch (variant) {
    case "plain":
      // over-under checkerboard: the simplest interlacing
      return (
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="transparent" />
          <rect width="8" height="8" fill={ink} opacity="0.82" />
          <rect x="8" y="8" width="8" height="8" fill={ink} opacity="0.82" />
          <rect x="8" width="8" height="8" fill={ink} opacity="0.16" />
          <rect y="8" width="8" height="8" fill={ink} opacity="0.16" />
        </pattern>
      );

    case "twill":
      // the diagonal wale that defines twill
      return (
        <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="transparent" />
          {[0, 6, 12].map((o) => (
            <rect key={o} x={o} y={0} width="6" height="6" fill={ink} opacity="0.8" />
          ))}
          {[0, 6, 12].map((o) => (
            <rect key={`b${o}`} x={(o + 6) % 18} y={6} width="6" height="6" fill={ink} opacity="0.8" />
          ))}
          {[0, 6, 12].map((o) => (
            <rect key={`c${o}`} x={(o + 12) % 18} y={12} width="6" height="6" fill={ink} opacity="0.8" />
          ))}
        </pattern>
      );

    case "satin":
      // long floats, scattered binding points
      return (
        <pattern id={id} width="25" height="25" patternUnits="userSpaceOnUse">
          <rect width="25" height="25" fill={ink} opacity="0.08" />
          {[
            [2, 2],
            [12, 7],
            [22, 12],
            [7, 17],
            [17, 22],
          ].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" fill={ink} opacity="0.85" />
          ))}
        </pattern>
      );

    case "rib":
      return (
        <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="transparent" />
          <rect width="5" height="12" fill={ink} opacity="0.75" />
          <rect x="7" width="2" height="12" fill={ink} opacity="0.25" />
        </pattern>
      );

    case "spectrum":
    default:
      // frequency space: a centred cross of harmonics, as an FFT of cloth looks
      return (
        <pattern id={id} width="200" height="200" patternUnits="userSpaceOnUse">
          <rect width="200" height="200" fill={ink} opacity="0.9" />
          <g fill="var(--paper-200)">
            <circle cx="100" cy="100" r="7" />
            {[26, 52, 78].map((d, i) => (
              <g key={d} opacity={0.85 - i * 0.22}>
                <circle cx={100 + d} cy="100" r={4 - i} />
                <circle cx={100 - d} cy="100" r={4 - i} />
                <circle cx="100" cy={100 + d} r={4 - i} />
                <circle cx="100" cy={100 - d} r={4 - i} />
              </g>
            ))}
            {[34, 68].map((d, i) => (
              <g key={`d${d}`} opacity={0.55 - i * 0.2}>
                <circle cx={100 + d} cy={100 + d} r={3 - i} />
                <circle cx={100 - d} cy={100 - d} r={3 - i} />
                <circle cx={100 + d} cy={100 - d} r={3 - i} />
                <circle cx={100 - d} cy={100 + d} r={3 - i} />
              </g>
            ))}
          </g>
          <line x1="100" y1="0" x2="100" y2="200" stroke={faint} strokeWidth="0.5" />
          <line x1="0" y1="100" x2="200" y2="100" stroke={faint} strokeWidth="0.5" />
        </pattern>
      );
  }
}
