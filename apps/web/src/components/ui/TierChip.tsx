import type { Tier } from "@kapra/genome-schema";

const TIER_VAR: Record<Tier, string> = {
  MEASURED: "var(--tier-measured)",
  ESTIMATED: "var(--tier-estimated)",
  INFERRED: "var(--tier-inferred)",
};

const TIER_GLOSS: Record<Tier, string> = {
  MEASURED: "computed from pixels",
  ESTIMATED: "model + confidence",
  INFERRED: "reasoned hypothesis",
};

/**
 * The honesty tier as a first-class typographic object. Every claim in kapra
 * wears one. Color is stable across the whole app (see @kapra/ui-tokens).
 */
export function TierChip({ tier, title }: { tier: Tier; title?: boolean }) {
  return (
    <span
      className="tier-chip"
      style={{ color: TIER_VAR[tier] }}
      title={title ? TIER_GLOSS[tier] : undefined}
    >
      {tier}
    </span>
  );
}
