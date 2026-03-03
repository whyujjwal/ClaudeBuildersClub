import { auth } from "@/auth";
import { backendFetch } from "@/lib/api-client";
import { AdminUsersPageClient } from "@/components/admin-users-page-client";
import type { UsersApiResponse } from "@/types/admin";

export default async function AdminUsersPage() {
  const session = await auth();

  const res = await backendFetch("/users/");
  if (!res.ok) {
    return (
      <div className="py-12 text-center">
        <p className="text-brand-text-muted">Failed to load users.</p>
      </div>
    );
  }

  const data: UsersApiResponse = await res.json();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-text">
          Users
        </h1>
        <p className="text-sm text-brand-text-secondary">
          Search, filter, and manage community members.
        </p>
      </div>

      <AdminUsersPageClient
        users={data.users}
        currentUid={session?.user?.email ?? ""}
      />
    </div>
  );
}
