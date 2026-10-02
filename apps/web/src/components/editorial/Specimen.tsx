import { WeavePlate, type PlateVariant } from "./WeavePlate";
import { swatchSrc } from "@/content/swatches";

/**
 * A specimen image. Falls back to a drawn weave plate when no rendered swatch
 * exists, so a gene that isn't live yet still has honest imagery.
 */
export function Specimen({
  swatch,
  plate = "twill",
  label,
  className = "",
  priority = false,
}: {
  // `| undefined` is explicit because the repo runs exactOptionalPropertyTypes,
  // and these are forwarded from optional content fields.
  swatch?: string | undefined;
  plate?: PlateVariant | undefined;
  label?: string | undefined;
  className?: string | undefined;
  priority?: boolean | undefined;
}) {
  if (!swatch) {
    return <WeavePlate variant={plate} className={className} label={label} />;
  }
  return (
    <div className={`relative overflow-hidden bg-surface-sunken ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={swatchSrc(swatch)}
        alt={label ? `${label} specimen` : "fabric specimen"}
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-cover"
      />
      {label && (
        <span className="readout absolute bottom-3 left-3 bg-surface/85 px-2 py-1 text-[0.625rem] uppercase tracking-[0.2em] text-ink-dim">
          {label}
        </span>
      )}
    </div>
  );
}
