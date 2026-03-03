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
  /** uid of the currently logged-in user */
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

/* ---------- sub-components ---------- */
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
      className="ml-2 rounded px-2 py-0.5 text-xs font-medium bg-brand-terracotta/15 text-brand-terracotta hover:bg-brand-terracotta/30 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
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

  /* ---- create group ---- */
  const handleCreate = async () => {
    if (!groupName.trim()) { setError("Group name is required."); return; }
    setSaving(true);
    setError(null);
    const res = await apiFetch("/api/groups", {
      method: "POST",
      body: JSON.stringify({ name: groupName.trim(), description: groupDesc.trim() || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.detail ?? "Failed to create group."); return; }
    setView("idle");
    setGroupName("");
    setGroupDesc("");
    refresh();
  };

  /* ---- join group ---- */
  const handleJoin = async () => {
    if (!joinCode.trim()) { setError("Enter the invite code."); return; }
    setSaving(true);
    setError(null);
    const res = await apiFetch("/api/groups/join", {
      method: "POST",
      body: JSON.stringify({ join_code: joinCode.trim().toUpperCase() }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.detail ?? "Failed to join group."); return; }
    setView("idle");
    setJoinCode("");
    refresh();
  };

  /* ---- leave group ---- */
  const handleLeave = async () => {
    if (group === null || group === "loading") return;
    if (!confirm(`Leave "${(group as Group).name}"? You can rejoin later with the code.`)) return;
    const g = group as Group;
    await apiFetch(`/api/groups/${g.id}/leave`, { method: "DELETE" });
    refresh();
  };

  /* ---- delete group ---- */
  const handleDelete = async () => {
    if (group === null || group === "loading") return;
    const g = group as Group;
    if (!confirm(`Delete "${g.name}"? This will remove it for all members.`)) return;
    await apiFetch(`/api/groups/${g.id}`, { method: "DELETE" });
    refresh();
  };

  /* ---- remove member ---- */
  const handleRemove = async (uid: string, name: string) => {
    if (group === null || group === "loading") return;
    if (!confirm(`Remove ${name} from the group?`)) return;
    const g = group as Group;
    const res = await apiFetch(`/api/groups/${g.id}/members/${uid}`, { method: "DELETE" });
    if (res.ok) {
      refresh();
    }
  };

  /* ---- render: loading ---- */
  if (group === "loading") {
    return (
      <div className="w-full max-w-xl rounded-xl border border-brand-border bg-brand-surface px-6 py-5 animate-pulse">
        <div className="h-4 w-40 rounded bg-brand-border" />
      </div>
    );
  }

  /* ---- render: no group + forms ---- */
  if (!group) {
    return (
      <div className="w-full max-w-xl space-y-4">
        {/* section heading */}
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <h3 className="text-base font-semibold text-brand-text">Group Project</h3>
        </div>

        {view === "idle" && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => { setView("create"); setError(null); }}
              className="flex-1 rounded-xl border border-brand-border bg-brand-surface px-5 py-3 text-sm font-medium text-brand-text hover:border-brand-terracotta/60 transition-all"
            >
              ✨ Create a group
            </button>
            <button
              onClick={() => { setView("join"); setError(null); }}
              className="flex-1 rounded-xl border border-brand-border bg-brand-surface px-5 py-3 text-sm font-medium text-brand-text hover:border-brand-terracotta/60 transition-all"
            >
              🔗 Join with code
            </button>
          </div>
        )}

        {view === "create" && (
          <div className="rounded-xl border border-brand-border bg-brand-surface p-5 space-y-4">
            <h4 className="text-sm font-semibold text-brand-text">Create a new group</h4>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name *"
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
            <div className="flex gap-3">
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
          <div className="rounded-xl border border-brand-border bg-brand-surface p-5 space-y-4">
            <h4 className="text-sm font-semibold text-brand-text">Join with invite code</h4>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="6-character code e.g. ABC123"
              maxLength={6}
              className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm font-mono text-brand-text uppercase placeholder:text-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-terracotta tracking-widest"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-3">
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

  /* ---- render: group card ---- */
  const g = group as Group;
  const isPM = g.pm_uid === currentUid;

  return (
    <div className="w-full max-w-xl rounded-xl border border-brand-border bg-brand-surface p-5 space-y-4">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">👥</span>
            <h3 className="text-base font-semibold text-brand-text">{g.name}</h3>
            {isPM && (
              <span className="rounded-full bg-brand-terracotta/15 px-2 py-0.5 text-[11px] font-semibold text-brand-terracotta">
                PM
              </span>
            )}
          </div>
          {g.description && (
            <p className="mt-1 text-xs text-brand-text-muted">{g.description}</p>
          )}
        </div>

        {/* PM actions */}
        {isPM ? (
          <button
            onClick={handleDelete}
            className="shrink-0 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:border-red-500/70 hover:text-red-300 transition-colors"
          >
            Delete group
          </button>
        ) : (
          <button
            onClick={handleLeave}
            className="shrink-0 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-text-secondary hover:text-brand-text transition-colors"
          >
            Leave
          </button>
        )}
      </div>

      {/* invite code (visible to all; especially useful for PM to share) */}
      <div className="flex items-center gap-2 rounded-lg bg-brand-bg border border-brand-border px-3 py-2">
        <span className="text-xs text-brand-text-muted">Invite code:</span>
        <span className="font-mono text-sm font-bold text-brand-terracotta tracking-widest">
          {g.join_code}
        </span>
        <CopyButton text={g.join_code} />
      </div>

      {/* members list */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-brand-text-muted uppercase tracking-wide">
          Members ({g.members.length})
        </p>
        {g.members.map((m) => (
          <div
            key={m.uid}
            className="flex items-center justify-between gap-3 rounded-lg bg-brand-bg px-3 py-2.5"
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
                <div className="h-7 w-7 rounded-full bg-brand-terracotta/20 flex items-center justify-center text-xs font-bold text-brand-terracotta shrink-0">
                  {m.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-brand-text truncate">
                    {m.name}
                  </span>
                  {m.is_pm && (
                    <span className="shrink-0 rounded-full bg-brand-terracotta/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-terracotta">
                      PM
                    </span>
                  )}
                  {m.uid === currentUid && (
                    <span className="shrink-0 text-[10px] text-brand-text-muted">(you)</span>
                  )}
                </div>
                <p className="text-[11px] text-brand-text-muted truncate">{m.email}</p>
              </div>
            </div>

            {/* PM can remove non-PM members */}
            {isPM && !m.is_pm && (
              <button
                onClick={() => handleRemove(m.uid, m.name)}
                className="shrink-0 text-[11px] text-red-400 hover:text-red-300 transition-colors"
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
