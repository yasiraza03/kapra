/**
 * Runtime Genome validation — NODE-ONLY (reads the schema file, uses ajv).
 * Import via `@kapra/genome-schema/validate`. Kept out of the pure root entry
 * so it never lands in a browser bundle.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import _Ajv, { type ValidateFunction } from "ajv";
import _addFormats from "ajv-formats";

// ajv v8 and ajv-formats are CJS; under NodeNext their default import types
// resolve to the module namespace rather than the constructable/callable
// value. At runtime the default *is* the class/function, so we re-cast.
const Ajv = _Ajv as unknown as typeof _Ajv.default;
const addFormats = _addFormats as unknown as typeof _addFormats.default;

function loadSchema(): Record<string, unknown> {
  // dist/validate.js sits at the package root's dist/, so ../schema points at
  // the shipped schema folder. fileURLToPath keeps this robust across bundlers.
  const path = fileURLToPath(
    new URL("../schema/genome.schema.v1.json", import.meta.url),
  );
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

export const genomeJsonSchema = loadSchema();

let _validate: ValidateFunction | null = null;
function validator(): ValidateFunction {
  if (_validate) return _validate;
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  _validate = ajv.compile(genomeJsonSchema);
  return _validate;
}

export interface GenomeValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validate an unknown value against the canonical genome schema. */
export function validateGenome(data: unknown): GenomeValidationResult {
  const v = validator();
  const valid = v(data) as boolean;
  const errors = (v.errors ?? []).map(
    (e) => `${e.instancePath || "(root)"} ${e.message ?? "is invalid"}`,
  );
  return { valid, errors };
}

/** Narrowing assertion: throws with readable detail if `data` is not a Genome. */
export function assertGenome(data: unknown): void {
  const { valid, errors } = validateGenome(data);
  if (!valid) {
    throw new Error(`Invalid Genome:\n  - ${errors.join("\n  - ")}`);
  }
}
