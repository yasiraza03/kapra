// Generates TypeScript types from the canonical JSON Schema.
// JSON Schema is the single source of truth; this keeps the TS side honest.
import { compileFromFile } from "json-schema-to-typescript";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(here, "../schema/genome.schema.v1.json");
const outPath = resolve(here, "../src/generated.ts");

const banner = `/**
 * AUTO-GENERATED from schema/genome.schema.v1.json — DO NOT EDIT BY HAND.
 * Run \`pnpm --filter @kapra/genome-schema generate\` to regenerate.
 */`;

const ts = await compileFromFile(schemaPath, {
  bannerComment: banner,
  additionalProperties: false,
  style: { singleQuote: false, semi: true },
});

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, ts, "utf8");
console.log(`[genome-schema] wrote ${outPath}`);
