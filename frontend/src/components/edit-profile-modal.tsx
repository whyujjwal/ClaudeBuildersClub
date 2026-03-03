"use client";

import { useState } from "react";

const SKILL_TAGS = [
  "Frontend", "Backend", "Full-Stack", "AI/ML", "NLP", "Computer Vision",
  "Data Science", "Design", "Product", "DevOps", "Mobile", "Security",
  "Blockchain", "Research", "Writing",
];

interface EditProfileModalProps {
  initialTrack: "product" | "research";
  initialPath: "solo" | "team";
  initialInterests: string[];
  initialPrd: string | null;
  onSave: () => void;
  onClose: () => void;
}

export function EditProfileModal({
  initialTrack,
  initialPath,
  initialInterests,
  initialPrd,
  onSave,
  onClose,
}: EditProfileModalProps) {
  const [track, setTrack] = useState<"product" | "research">(initialTrack);
  const [path, setPath] = useState<"solo" | "team">(initialPath);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialInterests));
  const [prd, setPrd] = useState(initialPrd ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) { next.delete(tag); } else { next.add(tag); }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          path,
          interests: [...selected],
          prd_document: prd.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed to save");
      }
      onSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const prdLabel = track === "product" ? "PRD" : "Research Proposal";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-brand-border bg-brand-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <h2 className="text-lg font-semibold text-brand-text">Edit your profile</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-muted hover:bg-brand-bg-warm hover:text-brand-text transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Track */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-text">Track</label>
            <div className="grid grid-cols-2 gap-3">
              {(["product", "research"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTrack(t)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all ${
                    track === t
                      ? "border-brand-terracotta bg-brand-terracotta-light text-brand-terracotta"
                      : "border-brand-border bg-brand-surface text-brand-text-secondary hover:border-brand-terracotta/50"
                  }`}
                >
                  {t === "product" ? "🛠 Product Development" : "🔬 Research"}
                </button>
              ))}
            </div>
          </div>

          {/* Path */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-text">Working style</label>
            <div className="grid grid-cols-2 gap-3">
              {(["solo", "team"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPath(p)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all ${
                    path === p
                      ? "border-brand-terracotta bg-brand-terracotta-light text-brand-terracotta"
                      : "border-brand-border bg-brand-surface text-brand-text-secondary hover:border-brand-terracotta/50"
                  }`}
                >
                  {p === "solo" ? "💡 Solo project" : "🤝 Join a team"}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-text">
              Skills &amp; interests{" "}
              <span className="text-brand-text-muted font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
                    selected.has(tag)
                      ? "bg-brand-terracotta text-white"
                      : "bg-brand-terracotta-light text-brand-terracotta hover:bg-brand-terracotta/20"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* PRD / Research doc */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-text">
              {prdLabel}{" "}
              <span className="text-brand-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={prd}
              onChange={(e) => setPrd(e.target.value)}
              placeholder={`Paste your ${prdLabel} here…`}
              rows={8}
              className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-text placeholder:text-brand-text-muted font-mono focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 focus:border-brand-terracotta/50 resize-none transition-all"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-300/50 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-brand-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-brand-border px-5 py-2.5 text-sm font-medium text-brand-text-secondary hover:bg-brand-bg-warm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-brand-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-terracotta-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
