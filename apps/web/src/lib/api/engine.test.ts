import { afterEach, describe, expect, it, vi } from "vitest";
import { probeEngine } from "./engine";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
  vi.restoreAllMocks();
});

describe("probeEngine", () => {
  it("returns ok with the parsed health on 200", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          status: "ok",
          service: "kapra-engine",
          version: "0.1.0",
          genomeSchemaVersion: "1.0.0",
        }),
        { status: 200 },
      ),
    ) as typeof fetch;

    const probe = await probeEngine();
    expect(probe.ok).toBe(true);
    if (probe.ok) expect(probe.health.service).toBe("kapra-engine");
  });

  it("returns a not-ok result instead of throwing when the engine is down", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    }) as typeof fetch;

    const probe = await probeEngine();
    expect(probe.ok).toBe(false);
    if (!probe.ok) expect(probe.error).toContain("ECONNREFUSED");
  });
});
