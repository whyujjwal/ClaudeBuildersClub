"use client";

interface FilterState {
  search: string;
  track: string | null;
  path: string | null;
  role: string | null;
  onboarding: string | null;
}

interface AdminUserFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  shownCount: number;
  totalCount: number;
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-brand-terracotta text-white"
          : "bg-brand-bg-warm text-brand-text-secondary hover:bg-brand-border"
      }`}
    >
      {label}
    </button>
  );
}

export function AdminUserFilters({
  filters,
  onChange,
  shownCount,
  totalCount,
}: AdminUserFiltersProps) {
  function toggle(key: keyof FilterState, value: string) {
    onChange({
      ...filters,
      [key]: filters[key] === value ? null : value,
    });
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full rounded-lg border border-brand-border bg-brand-surface py-2 pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-text-muted focus:border-brand-terracotta focus:outline-none"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-brand-text-muted">Track:</span>
        <Pill label="Product" active={filters.track === "product"} onClick={() => toggle("track", "product")} />
        <Pill label="Research" active={filters.track === "research"} onClick={() => toggle("track", "research")} />

        <span className="ml-2 text-xs text-brand-text-muted">Path:</span>
        <Pill label="Solo" active={filters.path === "solo"} onClick={() => toggle("path", "solo")} />
        <Pill label="Team" active={filters.path === "team"} onClick={() => toggle("path", "team")} />

        <span className="ml-2 text-xs text-brand-text-muted">Role:</span>
        <Pill label="Admin" active={filters.role === "admin"} onClick={() => toggle("role", "admin")} />
        <Pill label="PM" active={filters.role === "project_manager"} onClick={() => toggle("role", "project_manager")} />
        <Pill label="User" active={filters.role === "user"} onClick={() => toggle("role", "user")} />

        <span className="ml-2 text-xs text-brand-text-muted">Onboarding:</span>
        <Pill label="Done" active={filters.onboarding === "done"} onClick={() => toggle("onboarding", "done")} />
        <Pill label="Pending" active={filters.onboarding === "pending"} onClick={() => toggle("onboarding", "pending")} />
      </div>

      {/* Count */}
      <p className="text-xs text-brand-text-muted">
        Showing {shownCount} of {totalCount} users
      </p>
    </div>
  );
}
