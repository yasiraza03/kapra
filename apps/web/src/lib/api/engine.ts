/**
 * Thin server-side client for the kapra engine.
 *
 * Phase 0 hand-writes the health shape. From Phase 1 the full client is
 * generated from the engine's OpenAPI document so web and engine never drift
 * (see packages/genome-schema + the `contract:gen` script).
 */

const ENGINE_URL = process.env.ENGINE_INTERNAL_URL ?? "http://localhost:8000";

export interface EngineHealth {
  status: string;
  service: string;
  version: string;
  genomeSchemaVersion: string;
}

export type EngineProbe =
  | { ok: true; health: EngineHealth }
  | { ok: false; error: string };

/** Probe the engine. Never throws — returns a discriminated result. */
export async function probeEngine(): Promise<EngineProbe> {
  try {
    const res = await fetch(`${ENGINE_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) {
      return { ok: false, error: `engine responded ${res.status}` };
    }
    const health = (await res.json()) as EngineHealth;
    return { ok: true, health };
  } catch (err) {
    const error = err instanceof Error ? err.message : "unreachable";
    return { ok: false, error };
  }
}
