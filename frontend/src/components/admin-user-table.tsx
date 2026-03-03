"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";

interface User {
  uid: string;
  email: string;
  name: string;
  picture: string;
  role: UserRole;
}

interface AdminUserTableProps {
  users: User[];
  currentUid: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export function AdminUserTable({
  users: initialUsers,
  currentUid,
}: AdminUserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const { data: session } = useSession();

  async function handleRoleChange(uid: string, newRole: UserRole) {
    setLoading(uid);
    try {
      const res = await fetch(`${BACKEND_URL}/users/${uid}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.idToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, role: updated.role } : u))
        );
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to update role");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-brand-border bg-brand-bg-warm">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {users.map((user) => (
            <tr
              key={user.uid}
              className="transition-colors hover:bg-brand-surface-hover"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-brand-text">
                    {user.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-brand-text-secondary">
                {user.email}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex rounded-full bg-brand-terracotta-light px-2.5 py-0.5 text-xs font-medium text-brand-terracotta">
                  {ROLE_LABELS[user.role]}
                </span>
              </td>
              <td className="px-6 py-4">
                {user.email === currentUid ? (
                  <span className="text-xs text-brand-text-muted">You</span>
                ) : (
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user.uid, e.target.value as UserRole)
                    }
                    disabled={loading === user.uid}
                    className="rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm text-brand-text focus:border-brand-terracotta focus:outline-none disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
