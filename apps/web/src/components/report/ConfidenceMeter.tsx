import type { Tier } from "@kapra/genome-schema";

const TIER_VAR: Record<Tier, string> = {
  MEASURED: "var(--tier-measured)",
  ESTIMATED: "var(--tier-estimated)",
  INFERRED: "var(--tier-inferred)",
};

export function ConfidenceMeter({
  value,
  tier,
}: {
  value: number;
  tier: Tier;
}) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 bg-[color:var(--surface-line)]">
        <div
          className="h-full transition-[width] duration-[640ms] ease-liquid"
          style={{ width: `${pct}%`, backgroundColor: TIER_VAR[tier] }}
        />
      </div>
      <span className="readout text-xs text-ink-dim">{pct}%</span>
    </div>
  );
}
