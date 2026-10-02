import Link from "next/link";
import { probeEngine } from "@/lib/api/engine";
import { WeavePlate } from "@/components/editorial/WeavePlate";
import { GENES, PRINCIPLES, STATS, TIERS } from "@/content/site";

export default async function Home() {
  const probe = await probeEngine();
  const live = GENES.filter((g) => g.status === "live");

  return (
    <main>
      {/* ───────────────────────── hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-editorial px-5 pb-6 pt-14 sm:px-8 sm:pt-20">
          <div className="flex items-start justify-between gap-6">
            <p className="kicker max-w-[12rem] leading-[2] text-ink-dim">
              Fashion forensics
              <br />
              from a photograph
            </p>
            <p className="kicker hidden text-right leading-[2] text-ink-faint sm:block">
              Genome
              <br />
              v1.0.0
            </p>
          </div>

          {/* giant wordmark with an overlapping specimen plate */}
          <div className="relative mt-10 sm:mt-14">
            <h1 className="rise text-center font-display text-d1 font-semibold text-ink">
              KAPRA
            </h1>
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[30%] max-w-[260px] -translate-x-1/2 -translate-y-1/2 sm:h-[135%]">
              <WeavePlate variant="spectrum" className="h-full w-full" />
            </div>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
            <p className="max-w-xl font-sans text-lg leading-relaxed text-ink-dim">
              Photograph a piece of cloth. kapra reconstructs its{" "}
              <em className="font-display italic text-ink">genome</em> — weave,
              colour, texture, finish — using real signal processing, and stamps
              every reading with how far it can be trusted.
            </p>
            <div className="flex flex-wrap items-center gap-4 md:justify-end">
              <Link href="/analyze" className="btn-solid">
                Sequence a garment
              </Link>
              <Link href="/method" className="kicker link-draw text-ink-dim">
                The method →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── what it reads (dark band) ───────────────────── */}
      <section className="band-dark">
        <div className="mx-auto max-w-editorial px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-display text-d3 text-ink">What it reads</h2>
            <Link href="/genes" className="kicker link-draw text-ink-dim">
              Full index →
            </Link>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {live.map((g) => (
              <article key={g.id} className="group">
                <WeavePlate variant={g.plate} className="aspect-[4/5] w-full" />
                <h3 className="mt-5 font-display text-2xl text-ink">{g.name}</h3>
                <p className="readout mt-2 text-xs text-ink-faint">{g.method}</p>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-dim">
                  {g.reads}
                </p>
                <Link
                  href={`/genes#${g.id}`}
                  className="kicker link-draw mt-4 inline-block text-signal"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── editorial statement ───────────────── */}
      <section className="relative">
        <div className="mx-auto grid max-w-editorial items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
          <div>
            <p className="kicker text-signal">The thesis</p>
            <h2 className="mt-5 font-display text-d2 font-semibold leading-[0.95] text-ink">
              Measured,
              <br />
              not guessed.
            </h2>
            <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-ink-dim">
              Anyone can point a model at a photograph and produce a confident
              sentence. kapra does the harder, duller, more honest thing: it
              computes a number, shows you the figure that number came from, and
              tells you where its knowledge stops.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/about" className="btn-line">
                Read the thesis
              </Link>
            </div>
          </div>
          <div className="relative">
            <WeavePlate variant="twill" className="aspect-[4/3] w-full" label="twill · 45°" />
            <div className="absolute -bottom-6 -left-6 hidden w-40 sm:block">
              <WeavePlate variant="plain" className="aspect-square w-full" label="plain" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── principles strip ───────────────── */}
      <section className="rule-t rule-b bg-surface-raised">
        <div className="mx-auto grid max-w-editorial gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {PRINCIPLES.map((p) => (
            <div key={p.n}>
              <p className="readout text-xs text-signal">{p.n}</p>
              <h3 className="mt-3 font-sans text-base font-semibold text-ink">
                {p.title}
              </h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-ink-dim">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── honesty tiers ───────────────── */}
      <section>
        <div className="mx-auto max-w-editorial px-5 py-20 sm:px-8 sm:py-28">
          <p className="kicker text-ink-faint">The honesty system</p>
          <h2 className="mt-5 max-w-3xl font-display text-d2 font-semibold leading-[0.95] text-ink">
            Three tiers. Every claim wears one.
          </h2>

          <div className="mt-14 divide-y divide-[color:var(--surface-line)] border-y border-line">
            {TIERS.map((t, i) => (
              <div
                key={t.name}
                className="grid gap-5 py-9 md:grid-cols-[auto_1fr_1.4fr] md:items-baseline md:gap-10"
              >
                <span className="readout text-xs text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                  <h3 className="readout text-sm tracking-[0.18em] text-ink">
                    {t.name}
                  </h3>
                </div>
                <div>
                  <p className="font-display text-xl italic text-ink">{t.rule}</p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-ink-dim">
                    {t.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── stats (ink band) ───────────────── */}
      <section className="band-ink">
        <div className="mx-auto grid max-w-editorial grid-cols-2 gap-10 px-5 py-16 sm:px-8 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-5xl font-semibold text-ink sm:text-6xl">
                {s.value}
              </p>
              <p className="kicker mt-3 text-ink-faint">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── closing CTA ───────────────── */}
      <section className="blueprint-grid">
        <div className="mx-auto max-w-editorial px-5 py-24 text-center sm:px-8 sm:py-32">
          <p className="kicker text-ink-faint">Specimen intake</p>
          <h2 className="mx-auto mt-6 max-w-4xl font-display text-d2 font-semibold leading-[0.95] text-ink">
            Put a piece of cloth under the instrument.
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <Link href="/analyze" className="btn-solid">
              Begin analysis
            </Link>
            <Link href="/archive" className="kicker link-draw text-ink-dim">
              Browse the archive →
            </Link>
          </div>
          <p className="readout mt-12 text-xs text-ink-faint">
            engine{" "}
            {probe.ok ? (
              <span style={{ color: "var(--tier-measured)" }}>
                online · v{probe.health.version}
              </span>
            ) : (
              <span className="text-signal">offline — run `pnpm run dev`</span>
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
