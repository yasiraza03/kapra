import { test } from "node:test";
import assert from "node:assert/strict";
import { isTier, GENOME_SCHEMA_VERSION } from "../dist/index.js";
import { validateGenome, assertGenome } from "../dist/validate.js";

function sampleGenome() {
  return {
    schemaVersion: GENOME_SCHEMA_VERSION,
    id: "gen_test_0001",
    createdAt: "2026-10-02T12:00:00.000Z",
    source: {
      shots: [{ id: "s1", type: "macro", width: 2048, height: 2048 }],
      capture: { whiteBalanced: true },
    },
    genes: [
      {
        geneId: "weave",
        tier: "MEASURED",
        label: "Weave Structure",
        value: { family: "twill", periodicityPx: 7.2, orientationDeg: 63 },
        summary: "Twill weave, ~7px repeat at 63 degrees.",
        confidence: 0.82,
        evidence: [
          { kind: "measurement", label: "FFT dominant peak", value: 0.14 },
        ],
        viz: [{ id: "weave-fft", kind: "fft", title: "Weave FFT" }],
      },
    ],
  };
}

test("a well-formed genome validates", () => {
  const { valid, errors } = validateGenome(sampleGenome());
  assert.equal(valid, true, errors.join("; "));
});

test("a genome missing required evidence is rejected", () => {
  const g = sampleGenome();
  delete g.genes[0].evidence;
  const { valid } = validateGenome(g);
  assert.equal(valid, false);
});

test("an unknown tier is rejected", () => {
  const g = sampleGenome();
  g.genes[0].tier = "GUESSED";
  const { valid } = validateGenome(g);
  assert.equal(valid, false);
});

test("confidence out of range is rejected", () => {
  const g = sampleGenome();
  g.genes[0].confidence = 1.5;
  const { valid } = validateGenome(g);
  assert.equal(valid, false);
});

test("assertGenome throws readable errors", () => {
  assert.throws(() => assertGenome({ nope: true }), /Invalid Genome/);
});

test("tier guard works", () => {
  assert.equal(isTier("MEASURED"), true);
  assert.equal(isTier("nope"), false);
});
