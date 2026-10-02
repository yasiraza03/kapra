"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Genome } from "@kapra/genome-schema";
import { DEMO_SWATCHES, swatchSrc } from "@/content/swatches";

type Phase = "idle" | "ready" | "analyzing" | "error";

export function Uploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<File | null>(null);

  const choose = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("That isn't an image. Try a JPEG, PNG, or WebP.");
      setPhase("error");
      return;
    }
    fileRef.current = file;
    setFileName(file.name);
    setError(null);
    setPreview(URL.createObjectURL(file));
    setPhase("ready");
  }, []);

  const analyze = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    setPhase("analyzing");
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/engine/analyze", { method: "POST", body });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`engine returned ${res.status}: ${detail.slice(0, 160)}`);
      }
      const genome = (await res.json()) as Genome;
      router.push(`/genome/${genome.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "analysis failed");
      setPhase("error");
    }
  }, [router]);

  /** Load one of the shipped demo specimens so nobody needs a photo to start. */
  const loadSample = useCallback(
    async (slug: string, name: string) => {
      try {
        const res = await fetch(swatchSrc(slug));
        if (!res.ok) throw new Error(`could not load sample (${res.status})`);
        const blob = await res.blob();
        choose(new File([blob], `${slug}.jpg`, { type: "image/jpeg" }));
        setFileName(`${name} (sample)`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "could not load sample");
        setPhase("error");
      }
    },
    [choose],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) choose(file);
    },
    [choose],
  );

  const busy = phase === "analyzing";

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a garment photo"
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="blueprint-grid group relative flex min-h-[380px] cursor-pointer flex-col items-center justify-center overflow-hidden border border-line bg-surface-raised transition-colors duration-[320ms] ease-liquid hover:border-ink-faint"
        style={{
          borderColor: dragging ? "var(--signal)" : undefined,
          borderStyle: "dashed",
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Selected garment"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        ) : null}

        <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
          <span
            className="readout text-xs uppercase tracking-[0.3em]"
            style={{ color: dragging ? "var(--signal)" : "var(--ink-dim)" }}
          >
            {busy
              ? "analyzing…"
              : preview
                ? fileName ?? "image ready"
                : "drop a fabric photo or click to browse"}
          </span>
          {!preview && (
            <p className="max-w-sm font-sans text-sm leading-relaxed text-ink-faint">
              A close, well-lit macro of the weave reads best. JPEG / PNG / WebP, up to 15MB.
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) choose(file);
          }}
        />
      </div>

      {error && (
        <p className="readout mt-3 text-xs" style={{ color: "var(--signal)" }}>
          {error}
        </p>
      )}

      {/* shipped demo specimens — no photo required to try the instrument */}
      <div className="mt-6">
        <p className="kicker text-ink-faint">Or sequence a sample</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {DEMO_SWATCHES.map((s) => (
            <button
              key={s.slug}
              type="button"
              disabled={busy}
              onClick={() => void loadSample(s.slug, s.name)}
              title={`${s.name} — ${s.note}`}
              className="group relative aspect-square overflow-hidden border border-line transition-colors duration-[320ms] ease-liquid hover:border-signal disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={swatchSrc(s.slug)}
                alt={`${s.name} — ${s.note}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span className="readout absolute inset-x-0 bottom-0 bg-surface/85 py-1 text-center text-[0.5625rem] uppercase tracking-[0.14em] text-ink-dim">
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          disabled={phase !== "ready" && phase !== "error"}
          onClick={analyze}
          className="btn-solid disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "sequencing…" : "sequence genome"}
        </button>
        {preview && !busy && (
          <button
            type="button"
            onClick={() => {
              fileRef.current = null;
              setPreview(null);
              setFileName(null);
              setPhase("idle");
              setError(null);
            }}
            className="readout text-xs uppercase tracking-[0.2em] text-ink-faint transition-colors hover:text-ink-dim"
          >
            clear
          </button>
        )}
      </div>

      {busy && (
        <div className="mt-6 h-px w-full overflow-hidden bg-line">
          <div className="h-full w-1/3 animate-[scan_1.1s_ease-in-out_infinite] bg-signal" />
        </div>
      )}
      <style>{`@keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  );
}
