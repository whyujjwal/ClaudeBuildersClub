"use client";

import { useState, useMemo } from "react";
import { AdminUserFilters } from "@/components/admin-user-filters";
import { AdminUserTable } from "@/components/admin-user-table";
import type { AdminUser } from "@/types/admin";

interface AdminUsersPageClientProps {
  users: AdminUser[];
  currentUid: string;
}

export function AdminUsersPageClient({
  users,
  currentUid,
}: AdminUsersPageClientProps) {
  const [filters, setFilters] = useState({
    search: "",
    track: null as string | null,
    path: null as string | null,
    role: null as string | null,
    onboarding: null as string | null,
  });

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (filters.track && u.track !== filters.track) return false;
      if (filters.path && u.path !== filters.path) return false;
      if (filters.role && u.role !== filters.role) return false;
      if (filters.onboarding === "done" && !u.onboarding_completed)
        return false;
      if (filters.onboarding === "pending" && u.onboarding_completed)
        return false;
      return true;
    });
  }, [users, filters]);

  return (
    <div className="space-y-5">
      <AdminUserFilters
        filters={filters}
        onChange={setFilters}
        shownCount={filtered.length}
        totalCount={users.length}
      />
      <AdminUserTable users={filtered} currentUid={currentUid} />
    </div>
  );
}
