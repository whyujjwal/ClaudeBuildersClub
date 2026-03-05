"use client";

import { useState } from "react";
import { MarkdownPreview } from "@/components/markdown-preview";

interface PrdSubmitStepProps {
  track: "product" | "research";
  onComplete: (doc: string) => void;
  onSkip: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function PrdSubmitStep({
  track,
  onComplete,
  onSkip,
  onBack,
  loading = false,
}: PrdSubmitStepProps) {
  const [doc, setDoc] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");

  const label = track === "product" ? "PRD" : "Research Proposal";
  const placeholder =
    track === "product"
      ? "Paste your completed PRD here (Markdown supported) — Executive Summary, Problem Statement, Features, Tech Architecture…"
      : "Paste your completed Research Proposal here (Markdown supported) — Abstract, Methodology, Data Requirements, Expected Outcomes…";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-brand-terracotta uppercase tracking-wider">
          Step 4 of 4
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-text">
          Paste your {label}
        </h2>
        <p className="text-brand-text-secondary">
          Copy the {label} Claude generated for you and paste it below — we
          &apos;ll store it so you can always come back to it. Markdown is supported.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-border bg-brand-surface overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand-border bg-brand-bg-warm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-brand-terracotta" />
            <span className="text-xs font-medium text-brand-text-muted">
              Your {label}
            </span>
          </div>
          <div className="flex rounded-lg border border-brand-border overflow-hidden">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                tab === "write"
                  ? "bg-brand-surface text-brand-text"
                  : "bg-brand-bg-warm text-brand-text-muted hover:text-brand-text"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                tab === "preview"
                  ? "bg-brand-surface text-brand-text"
                  : "bg-brand-bg-warm text-brand-text-muted hover:text-brand-text"
              }`}
            >
              Preview
            </button>
          </div>
        </div>
        {tab === "write" ? (
          <textarea
            value={doc}
            onChange={(e) => setDoc(e.target.value)}
            placeholder={placeholder}
            rows={14}
            className="w-full bg-transparent px-5 py-4 text-sm text-brand-text placeholder:text-brand-text-muted focus:outline-none resize-none font-mono leading-relaxed"
          />
        ) : (
          <div className="px-5 py-4 min-h-[21rem] overflow-y-auto">
            <MarkdownPreview content={doc} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onComplete(doc)}
          disabled={!doc.trim() || loading}
          className="flex-1 rounded-xl bg-brand-terracotta px-6 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:bg-brand-terracotta-hover active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </span>
          ) : (
            `Save my ${label} →`
          )}
        </button>
        <button
          onClick={onSkip}
          disabled={loading}
          className="rounded-xl border border-brand-border bg-brand-surface px-5 py-3.5 text-sm font-medium text-brand-text-secondary hover:bg-brand-surface-hover transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-border"
        >
          Skip for now
        </button>
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-brand-text-muted hover:text-brand-text transition-colors mx-auto"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  );
}
