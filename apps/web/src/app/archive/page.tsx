import Link from "next/link";
import { listGenomes, type ArchiveEntry } from "@/lib/api/engine";
import { WeavePlate, type PlateVariant } from "@/components/editorial/WeavePlate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Specimen archive",
  description: "Every garment sequenced on this instance, with its headline readings.",
};

function plateFor(family?: string | null): PlateVariant {
  if (!family) return "spectrum";
  if (family.startsWith("twill")) return "twill";
  if (family.startsWith("plain")) return "plain";
  if (family.startsWith("satin")) return "satin";
  return "rib";
}

export default async function ArchivePage() {
  const items = await listGenomes(48);

  return (
    <main>
      <section className="rule-b">
        <div className="mx-auto max-w-editorial px-5 py-16 sm:px-8 sm:py-24">
          <p className="kicker text-signal">Specimen archive</p>
          <h1 className="mt-6 max-w-4xl font-display text-d2 font-semibold leading-[0.95] text-ink">
            Every swatch this instrument has read.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-ink-dim">
            Stored locally on your machine. Each entry keeps its full genome —
            the readings, the confidences, and the figures behind them.
          </p>
          <p className="readout mt-8 text-xs text-ink-faint">
            {items.length} {items.length === 1 ? "specimen" : "specimens"} on record
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-editorial px-5 py-16 sm:px-8">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <SpecimenCard key={it.id} entry={it} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SpecimenCard({ entry }: { entry: ArchiveEntry }) {
  const created = new Date(entry.createdAt);
  return (
    <Link href={`/genome/${entry.id}`} className="group block">
      <div className="relative">
        <WeavePlate variant={plateFor(entry.weaveFamily)} className="aspect-[4/5] w-full" />
        {entry.dominantHex && (
          <span
            className="absolute right-3 top-3 h-8 w-8 border border-line"
            style={{ backgroundColor: entry.dominantHex }}
            aria-label={`dominant colour ${entry.dominantHex}`}
          />
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h2 className="readout text-sm text-ink transition-colors group-hover:text-signal">
          {entry.id.replace("gen_", "")}
        </h2>
        <span className="readout text-xs text-ink-faint">
          {created.toISOString().slice(0, 10)}
        </span>
      </div>

      <dl className="mt-3 space-y-1.5">
        <Row k="weave" v={entry.weaveFamily ?? "—"} />
        <Row
          k="repeat"
          v={entry.periodicityPx != null ? `${entry.periodicityPx}px · ${entry.orientationDeg}°` : "—"}
        />
        <Row k="colour" v={entry.dominantHex ?? "—"} />
        <Row k="texture" v={entry.textureScale ?? "—"} />
        <Row k="finish" v={entry.finish ?? "—"} />
      </dl>
    </Link>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-1.5">
      <dt className="readout text-[0.625rem] uppercase tracking-[0.18em] text-ink-faint">
        {k}
      </dt>
      <dd className="readout text-xs text-ink-dim">{v}</dd>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="blueprint-grid border border-line px-6 py-24 text-center">
      <h2 className="font-display text-d3 text-ink">The archive is empty.</h2>
      <p className="mx-auto mt-4 max-w-md font-sans text-base leading-relaxed text-ink-dim">
        Nothing has been sequenced on this instance yet — or the engine
        isn&apos;t running. Start it with{" "}
        <code className="readout text-ink">pnpm run dev</code>.
      </p>
      <div className="mt-8">
        <Link href="/analyze" className="btn-solid">
          Sequence the first specimen
        </Link>
      </div>
    </div>
  );
}
