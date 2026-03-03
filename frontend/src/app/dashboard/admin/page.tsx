import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/api-client";
import { AdminUserTable } from "@/components/admin-user-table";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || session.role !== "admin") {
    redirect("/dashboard");
  }

  const res = await backendFetch("/users/");
  if (!res.ok) {
    return (
      <div className="text-center py-12">
        <p className="text-brand-text-muted">Failed to load users.</p>
      </div>
    );
  }

  const data = await res.json();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-brand-text">
          Admin Panel
        </h1>
        <p className="text-brand-text-secondary">
          Manage users and their roles.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-border bg-brand-surface p-6">
          <p className="text-sm text-brand-text-muted">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-brand-text">
            {data.total}
          </p>
        </div>
        <div className="rounded-xl border border-brand-border bg-brand-surface p-6">
          <p className="text-sm text-brand-text-muted">Admins</p>
          <p className="mt-2 text-3xl font-bold text-brand-text">
            {data.users.filter((u: { role: string }) => u.role === "admin").length}
          </p>
        </div>
        <div className="rounded-xl border border-brand-border bg-brand-surface p-6">
          <p className="text-sm text-brand-text-muted">Project Managers</p>
          <p className="mt-2 text-3xl font-bold text-brand-text">
            {data.users.filter((u: { role: string }) => u.role === "project_manager").length}
          </p>
        </div>
      </div>

      {/* User Table */}
      <AdminUserTable users={data.users} currentUid={session.user.email!} />
    </div>
  );
}
