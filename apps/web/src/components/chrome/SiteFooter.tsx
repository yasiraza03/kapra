import Link from "next/link";

const COLUMNS = [
  {
    title: "Instrument",
    links: [
      { href: "/analyze", label: "Analyze a specimen" },
      { href: "/genes", label: "The gene index" },
      { href: "/archive", label: "Specimen archive" },
    ],
  },
  {
    title: "Method",
    links: [
      { href: "/method", label: "How it reads cloth" },
      { href: "/method#honesty", label: "The honesty tiers" },
      { href: "/method#limits", label: "What it cannot do" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/about", label: "About kapra" },
      { href: "/about#thesis", label: "The thesis" },
      { href: "/about#colophon", label: "Colophon" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="band-ink">
      <div className="mx-auto max-w-editorial px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="font-display text-4xl font-semibold tracking-[0.18em] text-ink">
              KAPRA
            </p>
            <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-ink-dim">
              A garment forensics instrument. It measures cloth from photographs
              and tells you precisely how far to trust each reading.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="kicker mb-5 text-ink-faint">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="font-sans text-sm text-ink-dim transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="readout text-xs text-ink-faint">
            genome schema v1.0.0 · research use
          </p>
          <p className="readout text-xs text-ink-faint">
            no model weights · computed locally · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
