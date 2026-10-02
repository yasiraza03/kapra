import { Uploader } from "@/components/capture/Uploader";
import { WeavePlate } from "@/components/editorial/WeavePlate";

export const metadata = {
  title: "Analyze",
  description: "Upload a garment photo and sequence its genome.",
};

const PROTOCOL = [
  [
    "01",
    "Fill the frame",
    "Get close. The weave itself should be visible — a macro of the cloth, not a photograph of the whole garment.",
  ],
  [
    "02",
    "Even, diffuse light",
    "Avoid hard glare and deep shadow. Flat light keeps the colour and finish readings honest.",
  ],
  [
    "03",
    "Sharp focus",
    "Micro-detail is the signal. Blur reads as a coarser texture and drags every confidence down.",
  ],
  [
    "04",
    "Fill with cloth",
    "Crop out hands, tables and labels. The instrument samples the centre of the frame.",
  ],
];

export default function AnalyzePage() {
  return (
    <main>
      <section className="rule-b">
        <div className="mx-auto max-w-editorial px-5 py-14 sm:px-8 sm:py-20">
          <p className="kicker text-signal">Specimen intake</p>
          <h1 className="mt-6 max-w-3xl font-display text-d2 font-semibold leading-[0.95] text-ink">
            Submit a specimen.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-ink-dim">
            The engine reads weave, colour, texture and finish straight from the
            pixels — real signal processing, computed on your own machine, with
            every reading stamped by how far it can be trusted.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-editorial gap-14 px-5 py-14 sm:px-8 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Uploader />
          </div>

          <aside>
            <p className="kicker text-ink-faint">Shot protocol</p>
            <ol className="mt-7 divide-y divide-[color:var(--surface-line)] border-y border-line">
              {PROTOCOL.map(([n, title, body]) => (
                <li key={n} className="flex gap-5 py-5">
                  <span className="readout text-xs text-signal">{n}</span>
                  <div>
                    <p className="font-sans text-sm font-semibold text-ink">{title}</p>
                    <p className="mt-1.5 font-sans text-sm leading-relaxed text-ink-dim">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 grid grid-cols-3 gap-3">
              <WeavePlate variant="plain" className="aspect-square w-full" label="plain" />
              <WeavePlate variant="twill" className="aspect-square w-full" label="twill" />
              <WeavePlate variant="satin" className="aspect-square w-full" label="satin" />
            </div>
            <p className="mt-4 font-sans text-xs leading-relaxed text-ink-faint">
              Three structures the instrument distinguishes by their frequency
              signature alone.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
