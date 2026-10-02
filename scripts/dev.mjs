#!/usr/bin/env node
/**
 * One command, both servers. `pnpm run dev`
 *
 * Starts the Python engine (uvicorn :8000) and the Next.js web app (:3000) in a
 * single terminal with prefixed, colored output. Ctrl+C stops both cleanly.
 * Cross-platform (Windows / macOS / Linux), no extra dependencies.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";

const C = {
  reset: "\u001b[0m",
  dim: "\u001b[2m",
  engine: "\u001b[38;5;37m", // teal
  web: "\u001b[38;5;173m", // clay
  error: "\u001b[38;5;167m",
};

const WEB_PORT = process.env.WEB_PORT ?? "3000";
const ENGINE_PORT = process.env.ENGINE_PORT ?? "8000";

function venvPython() {
  const candidates = isWin
    ? [join(ROOT, "apps/engine/.venv/Scripts/python.exe")]
    : [join(ROOT, "apps/engine/.venv/bin/python")];
  return candidates.find((p) => existsSync(p)) ?? null;
}

const python = venvPython();
if (!python) {
  console.error(
    `${C.error}✗ The engine virtualenv is missing.${C.reset}\n` +
      `  Run setup first:  ${C.dim}pnpm run bootstrap${C.reset}\n`,
  );
  process.exit(1);
}

const children = [];
let shuttingDown = false;

function run(name, color, command, args, cwd, env = {}) {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env, FORCE_COLOR: "1" },
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const tag = `${color}${name.padEnd(6)}${C.reset} ${C.dim}│${C.reset} `;
  const pipe = (stream, isErr) => {
    let buffer = "";
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const out = isErr ? process.stderr : process.stdout;
        out.write(tag + line + "\n");
      }
    });
  };
  pipe(child.stdout, false);
  pipe(child.stderr, true); // uvicorn logs to stderr by design

  child.on("exit", (code) => {
    if (shuttingDown) return;
    console.log(`${tag}${C.error}exited with code ${code}${C.reset}`);
    shutdown(code ?? 1);
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null) {
      if (isWin) {
        spawn("taskkill", ["/pid", String(child.pid), "/f", "/t"], {
          stdio: "ignore",
        });
      } else {
        child.kill("SIGTERM");
      }
    }
  }
  setTimeout(() => process.exit(code), 400);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log(
  `\n${C.dim}kapra dev${C.reset}  ` +
    `${C.web}web${C.reset} http://localhost:${WEB_PORT}   ` +
    `${C.engine}engine${C.reset} http://localhost:${ENGINE_PORT}/docs\n`,
);

run(
  "engine",
  C.engine,
  python,
  [
    "-m",
    "uvicorn",
    "kapra_engine.main:app",
    "--app-dir",
    "src",
    "--reload",
    "--port",
    ENGINE_PORT,
  ],
  join(ROOT, "apps/engine"),
  { PYTHONUTF8: "1", PYTHONIOENCODING: "utf-8" },
);

run(
  "web",
  C.web,
  isWin ? "pnpm.cmd" : "pnpm",
  // Turbopack: dramatically faster cold starts, especially on Windows where
  // webpack's file watching crawls over node_modules.
  ["exec", "next", "dev", "--turbo", "-p", WEB_PORT],
  join(ROOT, "apps/web"),
  { ENGINE_INTERNAL_URL: `http://localhost:${ENGINE_PORT}` },
);
