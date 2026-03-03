import { backendFetch } from "@/lib/api-client";
import { AdminStatCard } from "@/components/admin-stat-card";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";
import type { UsersApiResponse } from "@/types/admin";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default async function AdminOverviewPage() {
  const res = await backendFetch("/users/");
  if (!res.ok) {
    return (
      <div className="py-12 text-center">
        <p className="text-brand-text-muted">Failed to load users.</p>
      </div>
    );
  }

  const data: UsersApiResponse = await res.json();
  const users = data.users;
  const total = data.total;

  const onboarded = users.filter((u) => u.onboarding_completed).length;
  const onboardedPct = total > 0 ? Math.round((onboarded / total) * 100) : 0;
  const productTrack = users.filter((u) => u.track === "product").length;
  const researchTrack = users.filter((u) => u.track === "research").length;
  const soloPath = users.filter((u) => u.path === "solo").length;
  const teamPath = users.filter((u) => u.path === "team").length;

  const recentUsers = [...users]
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 10);

  const roleCounts: Record<string, number> = {};
  for (const u of users) {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-text">
          Overview
        </h1>
        <p className="text-sm text-brand-text-secondary">
          Community snapshot at a glance.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <AdminStatCard label="Total Users" value={total} />
        <AdminStatCard
          label="Onboarded"
          value={`${onboardedPct}%`}
          subtitle={`${onboarded} of ${total}`}
          accent
        />
        <AdminStatCard label="Product Track" value={productTrack} />
        <AdminStatCard label="Research Track" value={researchTrack} />
        <AdminStatCard label="Solo Path" value={soloPath} />
        <AdminStatCard label="Team Path" value={teamPath} />
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Signups */}
        <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-text-muted">
            Recent Signups
          </h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.uid} className="flex items-center gap-3">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-bg-warm text-xs font-medium text-brand-text-secondary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-text">
                    {user.name}
                  </p>
                  <p className="text-xs text-brand-text-muted">
                    {timeAgo(user.created_at)}
                  </p>
                </div>
                {user.track && (
                  <span className="shrink-0 rounded-full bg-brand-bg-warm px-2 py-0.5 text-xs text-brand-text-secondary">
                    {user.track}
                  </span>
                )}
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-sm text-brand-text-muted">No users yet.</p>
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-text-muted">
            Role Distribution
          </h2>
          <div className="space-y-4">
            {(["user", "project_manager", "admin"] as UserRole[]).map(
              (role) => {
                const count = roleCounts[role] || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={role}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-brand-text">
                        {ROLE_LABELS[role]}
                      </span>
                      <span className="text-brand-text-muted">{count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-brand-bg-warm">
                      <div
                        className="h-full rounded-full bg-brand-terracotta transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
