import Link from "next/link";
import { WeavePlate } from "@/components/editorial/WeavePlate";

export const metadata = {
  title: "About",
  description:
    "The thesis behind kapra: a garment forensics instrument that measures rather than guesses, and is honest about where its knowledge stops.",
};

const STACK = [
  ["Engine", "Python · FastAPI · NumPy · OpenCV · scikit-image"],
  ["Web", "TypeScript · Next.js · Tailwind"],
  ["Contract", "JSON Schema → generated TypeScript + mirrored Pydantic"],
  ["Storage", "SQLite behind a repository seam"],
  ["Quality", "ruff · mypy --strict · pytest · ESLint · vitest · CI"],
];

export default function AboutPage() {
  return (
    <main>
      <section className="rule-b">
        <div className="mx-auto max-w-editorial px-5 py-16 sm:px-8 sm:py-24">
          <p className="kicker text-signal">About</p>
          <h1 className="mt-6 max-w-4xl font-display text-d2 font-semibold leading-[0.95] text-ink">
            An instrument, not an oracle.
          </h1>
        </div>
      </section>

      <section id="thesis" className="scroll-mt-32">
        <div className="mx-auto grid max-w-editorial gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.4fr_1fr]">
          <div className="max-w-2xl space-y-6 font-sans text-base leading-relaxed text-ink-dim">
            <p className="font-display text-2xl leading-snug text-ink">
              kapra began from a small irritation: almost every &ldquo;AI analyses
              your photo&rdquo; tool is a confident sentence with nothing
              underneath it.
            </p>
            <p>
              Cloth deserves better, because cloth is unusually legible. A woven
              fabric is a periodic structure. Its colour lives in a space we can
              measure perceptually. Its surface scatters light in ways that are
              describable with statistics rather than adjectives. Most of what a
              sourcing agent wants to know about a swatch is, in principle,
              sitting right there in the pixels.
            </p>
            <p>
              So kapra computes. A two-dimensional Fourier transform for the
              weave. k-means in CIELAB with CIEDE2000 distances for the dye.
              Local Binary Patterns for the texture. Specular statistics for the
              finish. Every one of those is a real number you could reproduce
              yourself, and every one is shown next to the figure it came from.
            </p>
            <p>
              The second half of the idea matters more than the first: the
              instrument has to say what it does not know. You cannot read grams
              per square metre off a JPEG, so kapra will not pretend to. It
              reports a class and an interval. When the photograph is poor, the
              confidence falls and the report tells you why. That restraint is
              the feature.
            </p>
            <p className="font-display text-xl italic text-ink">
              An instrument that overstates itself is not an instrument. It is
              decoration.
            </p>
          </div>
          <div className="space-y-6">
            <WeavePlate variant="plain" className="aspect-[4/5] w-full" label="plain weave" />
            <WeavePlate variant="satin" className="aspect-square w-full" label="satin float" />
          </div>
        </div>
      </section>

      <section className="band-dark">
        <div className="mx-auto max-w-editorial px-5 py-20 sm:px-8">
          <h2 className="font-display text-d3 text-ink">What it refuses to do</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Invent precision", "No fabricated GSM, no thread counts it cannot see."],
              ["Hide its workings", "Every claim links to the measurement behind it."],
              ["Depend on a black box", "The core runs on classical CV, locally, with no weights."],
              ["Lock you in", "Clone it, run one command, and it works on your machine."],
              ["Confuse guess with fact", "Hypotheses are labelled INFERRED, always."],
              ["Pretend licences away", "Dataset terms are documented, not glossed over."],
            ].map(([t, b]) => (
              <div key={t} className="border-t border-line pt-5">
                <h3 className="readout text-sm text-ink">{t}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-ink-dim">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="colophon" className="scroll-mt-32">
        <div className="mx-auto max-w-editorial px-5 py-20 sm:px-8">
          <p className="kicker text-ink-faint">Colophon</p>
          <h2 className="mt-5 font-display text-d3 text-ink">How it is built</h2>
          <dl className="mt-10 divide-y divide-[color:var(--surface-line)] border-y border-line">
            {STACK.map(([k, v]) => (
              <div key={k} className="grid gap-2 py-5 md:grid-cols-[200px_1fr] md:gap-10">
                <dt className="readout text-xs uppercase tracking-[0.2em] text-ink-faint">
                  {k}
                </dt>
                <dd className="font-sans text-sm text-ink-dim">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 max-w-2xl font-sans text-sm leading-relaxed text-ink-dim">
            Set in Bodoni Moda and Archivo, with IBM Plex Mono for every number.
            The palette is bone paper, near-black ink, cyanotype bands and a
            single thread of oxblood — after the cyanotype blueprints textiles
            were once archived on.
          </p>
          <div className="mt-10">
            <Link href="/method" className="btn-line">
              Read the method
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
