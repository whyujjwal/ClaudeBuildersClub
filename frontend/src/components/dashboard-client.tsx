"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { EditProfileModal } from "@/components/edit-profile-modal";
import { GroupSection } from "@/components/group-section";
import { MarkdownPreview } from "@/components/markdown-preview";

interface UserData {
  uid: string;
  name: string;
  email: string;
  picture: string;
  onboarding_completed: boolean;
  track: "product" | "research" | null;
  path: "solo" | "team" | null;
  interests: string[];
  prd_document: string | null;
}

interface DashboardClientProps {
  user: UserData;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  if (!user.onboarding_completed) {
    return <OnboardingFlow onComplete={() => router.refresh()} />;
  }

  const firstName = user.name.split(" ")[0];
  const trackLabel = user.track === "product" ? "Product" : "Research";
  const docLabel = user.track === "product" ? "PRD" : "Research Proposal";

  return (
    <div className="min-h-[80vh] space-y-8 px-2">

      {/* ── Page header ── */}
      <div className="border-b border-brand-border pb-6 pt-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-text-muted mb-1.5">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-brand-text">
          Good to see you, {firstName}.
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-medium text-brand-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-terracotta" />
            {trackLabel} track
          </span>
          {user.path && (
            <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-medium text-brand-text-secondary capitalize">
              {user.path}
            </span>
          )}
          {user.interests.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs text-brand-text-muted"
            >
              {tag}
            </span>
          ))}
          <button
            onClick={() => setEditOpen(true)}
            className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs text-brand-text-muted hover:text-brand-text hover:border-brand-terracotta/50 transition-colors"
          >
            Edit profile
          </button>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Project / PRD card */}
        <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-terracotta/10">
                <svg
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.75"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="text-brand-terracotta"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-brand-text">{docLabel}</span>
            </div>
            <button
              onClick={() => setEditOpen(true)}
              className="text-xs font-medium text-brand-text-muted hover:text-brand-terracotta transition-colors"
            >
              Edit
            </button>
          </div>

          {user.prd_document ? (
            <div className="flex-1 overflow-hidden max-h-60 overflow-y-auto">
              <MarkdownPreview content={user.prd_document} />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-start justify-center gap-3 py-6">
              <p className="text-sm text-brand-text-muted leading-relaxed">
                No document saved yet. Paste your {docLabel} to share it with your group.
              </p>
              <button
                onClick={() => setEditOpen(true)}
                className="rounded-lg bg-brand-terracotta/10 px-3 py-1.5 text-xs font-semibold text-brand-terracotta hover:bg-brand-terracotta/20 transition-colors"
              >
                Add document
              </button>
            </div>
          )}
        </div>

        {/* Group card */}
        <GroupSection currentUid={user.uid} />
      </div>

      {/* ── AI Credits form (visible after PRD/Research submission, or for team-path users) ── */}
      {(user.prd_document || user.path === "team") && (
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-terracotta/10">
              <svg
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round"
                className="text-brand-terracotta"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-brand-text">Claim your AI Credits</span>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Fill out the form below to receive your AI credits for building.
              </p>
            </div>
          </div>

          {/* Info banner */}
          <div className="mb-4 rounded-lg border border-brand-border bg-brand-bg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-brand-text-secondary">
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-terracotta shrink-0">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>CBC Meeting: <span className="font-medium text-brand-text">3rd March</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-terracotta shrink-0">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <span>Org ID: <span className="font-mono font-medium text-brand-text select-all">896df5cf-f036-4584-91fd-b3b0306384ad</span></span>
            </div>
          </div>

          <div className="w-full overflow-hidden rounded-xl border border-brand-border">
            <iframe
              src="https://www.jotform.com/253566966596075"
              className="w-full border-0"
              style={{ height: 600 }}
              allow="geolocation; microphone; camera; fullscreen"
              title="AI Credits Application"
            />
          </div>
        </div>
      )}

      {/* ── Coming soon strip ── */}
      <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface/40 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-brand-terracotta/50 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
          <p className="text-sm text-brand-text-muted">
            More features on the way — daily check-ins, milestones, and peer reviews.
          </p>
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && user.track && user.path && (
        <EditProfileModal
          initialTrack={user.track}
          initialPath={user.path}
          initialInterests={user.interests}
          initialPrd={user.prd_document}
          onClose={() => setEditOpen(false)}
          onSave={() => {
            setEditOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
