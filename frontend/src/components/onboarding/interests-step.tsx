"use client";

import { useState } from "react";

const SKILL_TAGS = [
  "Frontend",
  "Backend",
  "Full-Stack",
  "AI/ML",
  "NLP",
  "Computer Vision",
  "Data Science",
  "Design",
  "Product",
  "DevOps",
  "Mobile",
  "Security",
  "Blockchain",
  "Research",
  "Writing",
];

interface InterestsStepProps {
  onComplete: (interests: string[]) => void;
  onBack: () => void;
  loading?: boolean;
}

export function InterestsStep({
  onComplete,
  onBack,
  loading = false,
}: InterestsStepProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [other, setOther] = useState("");

  const toggle = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleSubmit = () => {
    const interests = [...selected];
    if (other.trim()) interests.push(other.trim());
    onComplete(interests);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-brand-terracotta uppercase tracking-wider">
          Step 3 of 3
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-text">
          What are your skills &amp; interests?
        </h2>
        <p className="text-brand-text-secondary">
          Select everything that applies — we'll use this to suggest the right
          teams for you.
        </p>
      </div>

      {/* Tag cloud */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-6">
        <div className="flex flex-wrap gap-2">
          {SKILL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 ${
                selected.has(tag)
                  ? "bg-brand-terracotta text-white shadow-sm"
                  : "bg-brand-terracotta-light text-brand-terracotta hover:bg-brand-terracotta/20"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {selected.size > 0 && (
          <p className="mt-4 text-xs text-brand-text-muted">
            {selected.size} selected
          </p>
        )}
      </div>

      {/* Free text */}
      <div className="space-y-2">
        <label
          htmlFor="other-interests"
          className="block text-sm font-medium text-brand-text"
        >
          Anything else? <span className="text-brand-text-muted">(optional)</span>
        </label>
        <textarea
          id="other-interests"
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="e.g. Robotics, Bioinformatics, Game dev…"
          rows={3}
          className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 focus:border-brand-terracotta/50 resize-none transition-all"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected.size === 0 && !other.trim() || loading}
        className="w-full rounded-xl bg-brand-terracotta px-6 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:bg-brand-terracotta-hover active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Saving…
          </span>
        ) : (
          "Save interests →"
        )}
      </button>

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-brand-text-muted hover:text-brand-text transition-colors mx-auto"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  );
}
