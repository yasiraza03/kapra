/**
 * Thin server-side client for the kapra engine.
 *
 * Phase 0 hand-writes the health shape. From Phase 1 the full client is
 * generated from the engine's OpenAPI document so web and engine never drift
 * (see packages/genome-schema + the `contract:gen` script).
 */

import type { Genome } from "@kapra/genome-schema";

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

export interface ArchiveEntry {
  id: string;
  createdAt: string;
  geneCount: number;
  weaveFamily?: string | null;
  weaveConfidence?: number | null;
  periodicityPx?: number | null;
  orientationDeg?: number | null;
  dominantHex?: string | null;
  evenness?: number | null;
  textureScale?: string | null;
  finish?: string | null;
}

/** Recent specimen summaries for the archive. Empty array if unreachable. */
export async function listGenomes(limit = 24): Promise<ArchiveEntry[]> {
  try {
    const res = await fetch(`${ENGINE_URL}/genomes?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { items: ArchiveEntry[] };
    return body.items ?? [];
  } catch {
    return [];
  }
}

/** Fetch a stored genome server-side. Returns null on 404 / unreachable. */
export async function getGenome(id: string): Promise<Genome | null> {
  try {
    const res = await fetch(`${ENGINE_URL}/genome/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Genome;
  } catch {
    return null;
  }
}
