import Link from "next/link";

export default function NotFound() {
  return (
    <main className="blueprint-grid">
      <div className="mx-auto flex max-w-editorial flex-col items-center px-5 py-32 text-center sm:px-8">
        <p className="kicker text-signal">404</p>
        <h1 className="mt-6 max-w-2xl font-display text-d2 font-semibold leading-[0.95] text-ink">
          No specimen at this address.
        </h1>
        <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-ink-dim">
          The genome you asked for isn&apos;t in this archive. It may have been
          sequenced on another machine — genomes are stored locally.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/analyze" className="btn-solid">
            Sequence a garment
          </Link>
          <Link href="/archive" className="btn-line">
            Browse the archive
          </Link>
        </div>
      </div>
    </main>
  );
}
