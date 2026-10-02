/**
 * @kapra/genome-schema — the single source of truth for the garment Genome.
 *
 * This entry is PURE and isomorphic: types generated from the canonical JSON
 * Schema, plus the small hand-maintained constants and guards. It has no side
 * effects and no Node-only dependencies, so it is safe to import from the
 * browser bundle.
 *
 * The runtime validator (ajv + the schema file) lives behind the `./validate`
 * subpath, which is Node-only — import it server-side when you need it.
 */

export * from "./generated.js";
import type { Tier, ShotType } from "./generated.js";

export const GENOME_SCHEMA_VERSION = "1.0.0" as const;

export const TIERS = ["MEASURED", "ESTIMATED", "INFERRED"] as const;
export const SHOT_TYPES = [
  "full-front",
  "full-back",
  "macro",
  "detail",
  "label",
  "backlit",
] as const;

export function isTier(x: unknown): x is Tier {
  return typeof x === "string" && (TIERS as readonly string[]).includes(x);
}

export function isShotType(x: unknown): x is ShotType {
  return typeof x === "string" && (SHOT_TYPES as readonly string[]).includes(x);
}
