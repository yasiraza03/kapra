#!/usr/bin/env node
/**
 * One command setup for a fresh clone. `pnpm run bootstrap`
 *
 * 1. builds the shared genome schema (generates TS types from JSON Schema)
 * 2. creates the engine virtualenv
 * 3. installs the engine with its classical-CV stack
 *
 * No model weights are downloaded — the core product runs entirely on
 * numpy/OpenCV/scikit-image, so this works offline after the package installs.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";
const ENGINE = join(ROOT, "apps/engine");

const C = { reset: "\u001b[0m", dim: "\u001b[2m", ok: "\u001b[38;5;37m", err: "\u001b[38;5;167m" };

function step(label) {
  console.log(`\n${C.dim}──${C.reset} ${label}`);
}

function sh(command, args, cwd) {
  const res = spawnSync(command, args, { cwd, stdio: "inherit", shell: false });
  if (res.status !== 0) {
    console.error(`${C.err}✗ failed: ${command} ${args.join(" ")}${C.reset}`);
    process.exit(res.status ?? 1);
  }
}

function findSystemPython() {
  const candidates = isWin ? ["py", "python"] : ["python3", "python"];
  for (const c of candidates) {
    const res = spawnSync(c, ["--version"], { stdio: "ignore", shell: false });
    if (res.status === 0) return c;
  }
  return null;
}

step("building the shared genome schema");
sh(isWin ? "pnpm.cmd" : "pnpm", ["--filter", "@kapra/genome-schema", "build"], ROOT);

const venvPython = isWin
  ? join(ENGINE, ".venv/Scripts/python.exe")
  : join(ENGINE, ".venv/bin/python");

if (!existsSync(venvPython)) {
  step("creating the engine virtualenv");
  const py = findSystemPython();
  if (!py) {
    console.error(`${C.err}✗ Python 3.12+ not found on PATH.${C.reset}`);
    process.exit(1);
  }
  sh(py, ["-m", "venv", ".venv"], ENGINE);
} else {
  step("engine virtualenv already present");
}

step("installing the engine (fastapi + classical CV stack)");
sh(venvPython, ["-m", "pip", "install", "--upgrade", "pip", "--quiet"], ENGINE);
sh(venvPython, ["-m", "pip", "install", "-e", ".[dev,cv,db]"], ENGINE);

console.log(
  `\n${C.ok}✓ ready${C.reset}  start everything with  ${C.dim}pnpm run dev${C.reset}\n`,
);
