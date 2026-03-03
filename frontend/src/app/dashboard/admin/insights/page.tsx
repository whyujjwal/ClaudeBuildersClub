import { backendFetch } from "@/lib/api-client";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";
import type { UsersApiResponse } from "@/types/admin";

function HorizontalBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-brand-text">{label}</span>
        <span className="text-brand-text-muted">
          {count} ({Math.round(pct)}%)
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-brand-bg-warm">
        <div
          className={`h-full rounded-full transition-all ${color || "bg-brand-terracotta"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function AdminInsightsPage() {
  const res = await backendFetch("/users/");
  if (!res.ok) {
    return (
      <div className="py-12 text-center">
        <p className="text-brand-text-muted">Failed to load data.</p>
      </div>
    );
  }

  const data: UsersApiResponse = await res.json();
  const users = data.users;
  const total = users.length;

  // Track distribution
  const productCount = users.filter((u) => u.track === "product").length;
  const researchCount = users.filter((u) => u.track === "research").length;

  // Path distribution
  const soloCount = users.filter((u) => u.path === "solo").length;
  const teamCount = users.filter((u) => u.path === "team").length;

  // Onboarding funnel
  const onboarded = users.filter((u) => u.onboarding_completed).length;
  const hasPrd = users.filter((u) => u.prd_document).length;

  // Role distribution
  const roleCounts: Record<string, number> = {};
  for (const u of users) {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  }

  // Interest frequency
  const interestMap: Record<string, number> = {};
  for (const u of users) {
    for (const tag of u.interests) {
      interestMap[tag] = (interestMap[tag] || 0) + 1;
    }
  }
  const sortedInterests = Object.entries(interestMap).sort(
    (a, b) => b[1] - a[1]
  );
  const maxInterestCount =
    sortedInterests.length > 0 ? sortedInterests[0][1] : 1;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-text">
          Insights
        </h1>
        <p className="text-sm text-brand-text-secondary">
          Community distributions and onboarding funnel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Track Distribution */}
        <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-text-muted">
            Track Distribution
          </h2>
          <div className="space-y-4">
            <HorizontalBar label="Product" count={productCount} total={total} />
            <HorizontalBar
              label="Research"
              count={researchCount}
              total={total}
              color="bg-amber-500"
            />
          </div>
        </div>

        {/* Path Distribution */}
        <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-text-muted">
            Path Distribution
          </h2>
          <div className="space-y-4">
            <HorizontalBar label="Solo" count={soloCount} total={total} />
            <HorizontalBar
              label="Team"
              count={teamCount}
              total={total}
              color="bg-blue-500"
            />
          </div>
        </div>

        {/* Onboarding Funnel */}
        <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-text-muted">
            Onboarding Funnel
          </h2>
          <div className="flex items-end gap-6 pt-2">
            {[
              { label: "Total", value: total },
              { label: "Onboarded", value: onboarded },
              { label: "Has PRD/Proposal", value: hasPrd },
            ].map((step) => {
              const pct = total > 0 ? (step.value / total) * 100 : 0;
              return (
                <div key={step.label} className="flex flex-1 flex-col items-center">
                  <span className="mb-1 text-lg font-bold text-brand-text">
                    {step.value}
                  </span>
                  <div className="w-full overflow-hidden rounded-t-lg bg-brand-bg-warm" style={{ height: "120px" }}>
                    <div
                      className="w-full bg-brand-terracotta transition-all"
                      style={{
                        height: `${pct}%`,
                        marginTop: `${100 - pct}%`,
                      }}
                    />
                  </div>
                  <span className="mt-2 text-center text-xs text-brand-text-muted">
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-text-muted">
            Role Distribution
          </h2>
          <div className="space-y-4">
            {(["user", "project_manager", "admin"] as UserRole[]).map(
              (role) => (
                <HorizontalBar
                  key={role}
                  label={ROLE_LABELS[role]}
                  count={roleCounts[role] || 0}
                  total={total}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Popular Interests — full width */}
      <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-text-muted">
          Popular Interests
        </h2>
        {sortedInterests.length > 0 ? (
          <div className="space-y-2.5">
            {sortedInterests.map(([tag, count]) => {
              const pct = (count / maxInterestCount) * 100;
              return (
                <div key={tag}>
                  <div className="mb-0.5 flex items-center justify-between text-sm">
                    <span className="text-brand-text">{tag}</span>
                    <span className="text-brand-text-muted">
                      {count} {count === 1 ? "user" : "users"}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-brand-bg-warm">
                    <div
                      className="h-full rounded-full bg-brand-terracotta transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-brand-text-muted">
            No interests data yet.
          </p>
        )}
      </div>
    </div>
  );
}
