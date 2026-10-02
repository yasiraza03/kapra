"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/method", label: "Method" },
  { href: "/genes", label: "Genes" },
  { href: "/archive", label: "Archive" },
  { href: "/about", label: "About" },
];

const TICKER = [
  "measured, not guessed",
  "2D Fourier weave analysis",
  "CIELAB dye forensics",
  "zero model weights",
  "runs on your machine",
  "every claim carries its evidence",
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* ticker */}
      <div className="band-ink marquee py-2">
        <div>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="kicker text-ink-dim">
              {t} <span className="text-signal">◦</span>
            </span>
          ))}
        </div>
      </div>

      {/* nav */}
      <div className="rule-b bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-editorial items-center justify-between px-5 py-4 sm:px-8">
          <nav className="hidden flex-1 items-center gap-7 md:flex">
            {NAV.slice(0, 2).map((n) => (
              <NavLink key={n.href} {...n} active={pathname === n.href} />
            ))}
          </nav>

          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-[0.2em] text-ink sm:text-[1.75rem]"
            aria-label="kapra home"
          >
            KAPRA
          </Link>

          <nav className="hidden flex-1 items-center justify-end gap-7 md:flex">
            {NAV.slice(2).map((n) => (
              <NavLink key={n.href} {...n} active={pathname === n.href} />
            ))}
            <Link href="/analyze" className="kicker text-signal link-draw">
              Analyze
            </Link>
          </nav>

          {/* mobile toggle */}
          <button
            type="button"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="kicker text-ink md:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        {open && (
          <nav className="rule-t flex flex-col gap-1 px-5 py-4 md:hidden">
            {[...NAV, { href: "/analyze", label: "Analyze" }].map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="kicker py-2 text-ink-dim"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`kicker link-draw ${active ? "text-ink" : "text-ink-dim hover:text-ink"}`}
    >
      {label}
    </Link>
  );
}
