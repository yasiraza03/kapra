import type { Evidence } from "@kapra/genome-schema";

function fmt(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k} ${v}`)
      .join(" · ");
  }
  return null;
}

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  return (
    <ul className="space-y-1.5">
      {evidence.map((e, i) => {
        const v = fmt(e.value);
        return (
          <li key={i} className="flex gap-2 font-sans text-xs leading-relaxed text-ink-faint">
            <span aria-hidden className="select-none text-ink-faint">
              &mdash;
            </span>
            <span>
              <span className="text-ink-dim">{e.label}</span>
              {v != null && <span className="readout text-ink"> : {v}</span>}
              {e.detail && <span className="text-ink-faint"> ({e.detail})</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
