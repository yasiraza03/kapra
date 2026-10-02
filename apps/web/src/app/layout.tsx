import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "kapra — garment forensics",
    template: "%s · kapra",
  },
  description:
    "A garment forensics instrument. Feed it photographs; it reconstructs the garment's genome using real computer vision, and tells you exactly how confident it is and why.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are loaded as a runtime stylesheet rather than next/font so the
          build never needs network access — a fresh clone builds and runs
          offline, falling back to the stacks declared in tokens.css.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* The App Router root layout *is* the document, so this applies to
            every page — the pages-router rule below does not apply here. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..700&family=Archivo:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* Browser extensions (e.g. Grammarly) inject attributes on <body> before
          hydration; suppress only that benign attribute mismatch. */}
      <body suppressHydrationWarning>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
