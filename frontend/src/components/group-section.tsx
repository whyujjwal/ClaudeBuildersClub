"use client";

import { useState, useEffect } from "react";

/* ---------- types ---------- */
interface GroupMember {
  uid: string;
  name: string;
  email: string;
  picture: string;
  is_pm: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  pm_uid: string;
  members: GroupMember[];
  track: string | null;
}

interface GroupSectionProps {
  currentUid: string;
}

/* ---------- helpers ---------- */
async function apiFetch(url: string, opts: RequestInit = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
  });
  return res;
}

/* ---------- icons ---------- */
function IconUsers() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-brand-terracotta">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

/* ---------- copy button ---------- */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="ml-auto rounded px-2 py-0.5 text-xs font-medium bg-brand-terracotta/10 text-brand-terracotta hover:bg-brand-terracotta/20 transition-colors"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ============================================================
   Main component
   ============================================================ */
export function GroupSection({ currentUid }: GroupSectionProps) {
  const [group, setGroup] = useState<Group | null | "loading">("loading");
  const [view, setView] = useState<"idle" | "create" | "join">("idle");
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/groups/my");
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setGroup(data);
        } else {
          if (!cancelled) setGroup(null);
        }
      } catch {
        if (!cancelled) setGroup(null);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleCreate = async () => {
    if (!groupName.trim()) { setError("Group name is required."); return; }
    setSaving(true); setError(null);
    const res = await apiFetch("/api/groups", {
      method: "POST",
      body: JSON.stringify({ name: groupName.trim(), description: groupDesc.trim() || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.detail ?? "Failed to create group."); return; }
    setView("idle"); setGroupName(""); setGroupDesc(""); refresh();
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) { setError("Enter the invite code."); return; }
    setSaving(true); setError(null);
    const res = await apiFetch("/api/groups/join", {
      method: "POST",
      body: JSON.stringify({ join_code: joinCode.trim().toUpperCase() }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.detail ?? "Failed to join group."); return; }
    setView("idle"); setJoinCode(""); refresh();
  };

  const handleLeave = async () => {
    if (!group || group === "loading") return;
    if (!confirm(`Leave "${(group as Group).name}"?`)) return;
    await apiFetch(`/api/groups/${(group as Group).id}/leave`, { method: "DELETE" });
    refresh();
  };

  const handleDelete = async () => {
    if (!group || group === "loading") return;
    if (!confirm(`Delete "${(group as Group).name}"? This removes it for all members.`)) return;
    await apiFetch(`/api/groups/${(group as Group).id}`, { method: "DELETE" });
    refresh();
  };

  const handleRemove = async (uid: string, name: string) => {
    if (!group || group === "loading") return;
    if (!confirm(`Remove ${name} from the group?`)) return;
    const res = await apiFetch(`/api/groups/${(group as Group).id}/members/${uid}`, { method: "DELETE" });
    if (res.ok) refresh();
  };

  /* ── loading skeleton ── */
  if (group === "loading") {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface p-6 animate-pulse">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-brand-border" />
          <div className="h-4 w-28 rounded bg-brand-border" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-brand-border" />
          <div className="h-3 w-3/4 rounded bg-brand-border" />
        </div>
      </div>
    );
  }

  /* ── no group ── */
  if (!group) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface p-6">
        {/* header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-terracotta/10">
            <IconUsers />
          </div>
          <span className="text-sm font-semibold text-brand-text">Group</span>
        </div>

        {view === "idle" && (
          <>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              Collaborate with others on a shared project. Create a group or join one with an invite code.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => { setView("create"); setError(null); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-bg px-4 py-2.5 text-sm font-medium text-brand-text hover:border-brand-terracotta/50 transition-colors"
              >
                <IconPlus /> Create group
              </button>
              <button
                onClick={() => { setView("join"); setError(null); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-bg px-4 py-2.5 text-sm font-medium text-brand-text hover:border-brand-terracotta/50 transition-colors"
              >
                <IconLink /> Join with code
              </button>
            </div>
          </>
        )}

        {view === "create" && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide">New group</p>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            />
            <textarea
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              placeholder="Short description (optional)"
              rows={2}
              className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-terracotta resize-none"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 rounded-lg bg-brand-terracotta px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => { setView("idle"); setError(null); }}
                className="rounded-lg border border-brand-border px-4 py-2 text-sm text-brand-text-secondary hover:text-brand-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {view === "join" && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide">Join a group</p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="6-character code"
              maxLength={6}
              className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm font-mono text-brand-text uppercase placeholder:normal-case placeholder:text-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-terracotta tracking-widest"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleJoin}
                disabled={saving}
                className="flex-1 rounded-lg bg-brand-terracotta px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? "Joining…" : "Join"}
              </button>
              <button
                onClick={() => { setView("idle"); setError(null); }}
                className="rounded-lg border border-brand-border px-4 py-2 text-sm text-brand-text-secondary hover:text-brand-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── group card ── */
  const g = group as Group;
  const isPM = g.pm_uid === currentUid;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-brand-border bg-brand-surface p-6">
      {/* header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-terracotta/10 mt-0.5">
            <IconUsers />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-brand-text">{g.name}</span>
              {isPM && (
                <span className="rounded-full bg-brand-terracotta/15 px-2 py-0.5 text-[10px] font-semibold text-brand-terracotta uppercase tracking-wide">
                  PM
                </span>
              )}
            </div>
            {g.description && (
              <p className="mt-0.5 text-xs text-brand-text-muted">{g.description}</p>
            )}
          </div>
        </div>

        {isPM ? (
          <button
            onClick={handleDelete}
            className="shrink-0 text-xs font-medium text-red-400/70 hover:text-red-400 transition-colors"
          >
            Delete
          </button>
        ) : (
          <button
            onClick={handleLeave}
            className="shrink-0 text-xs font-medium text-brand-text-muted hover:text-brand-text transition-colors"
          >
            Leave
          </button>
        )}
      </div>

      {/* invite code bar */}
      <div className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-bg px-3 py-2">
        <span className="text-[11px] text-brand-text-muted shrink-0">Invite code</span>
        <span className="font-mono text-sm font-bold text-brand-terracotta tracking-widest">
          {g.join_code}
        </span>
        <CopyButton text={g.join_code} />
      </div>

      {/* members */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-text-muted">
          Members · {g.members.length}
        </p>
        {g.members.map((m) => (
          <div
            key={m.uid}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-brand-bg transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {m.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.picture}
                  alt={m.name}
                  className="h-7 w-7 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-brand-terracotta/15 flex items-center justify-center text-xs font-bold text-brand-terracotta shrink-0">
                  {m.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium text-brand-text truncate">{m.name}</span>
                  {m.is_pm && (
                    <span className="rounded-full bg-brand-terracotta/15 px-1.5 py-0.5 text-[9px] font-semibold text-brand-terracotta uppercase tracking-wide shrink-0">
                      PM
                    </span>
                  )}
                  {m.uid === currentUid && (
                    <span className="text-[10px] text-brand-text-muted shrink-0">you</span>
                  )}
                </div>
                <p className="text-[11px] text-brand-text-muted truncate">{m.email}</p>
              </div>
            </div>

            {isPM && !m.is_pm && (
              <button
                onClick={() => handleRemove(m.uid, m.name)}
                className="shrink-0 text-[11px] text-brand-text-muted hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

