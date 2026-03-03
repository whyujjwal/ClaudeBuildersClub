"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";
import type { AdminUser } from "@/types/admin";

interface AdminUserTableProps {
  users: AdminUser[];
  currentUid: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminUserTable({
  users: initialUsers,
  currentUid,
}: AdminUserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedUid, setExpandedUid] = useState<string | null>(null);
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
    <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-brand-border bg-brand-bg-warm">
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              User
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              Track
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              Path
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              Onboarding
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              Role
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              Joined
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {users.map((user) => (
            <>
              <tr
                key={user.uid}
                className="cursor-pointer transition-colors hover:bg-brand-surface-hover"
                onClick={() =>
                  setExpandedUid(expandedUid === user.uid ? null : user.uid)
                }
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
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
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-brand-text">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-brand-text-muted">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {user.track ? (
                    <span className="inline-block rounded-full bg-brand-bg-warm px-2.5 py-0.5 text-xs font-medium text-brand-text-secondary">
                      {user.track}
                    </span>
                  ) : (
                    <span className="text-xs text-brand-text-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {user.path ? (
                    <span className="inline-block rounded-full bg-brand-bg-warm px-2.5 py-0.5 text-xs font-medium text-brand-text-secondary">
                      {user.path}
                    </span>
                  ) : (
                    <span className="text-xs text-brand-text-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        user.onboarding_completed
                          ? "bg-green-500"
                          : "bg-yellow-400"
                      }`}
                    />
                    <span className="text-xs text-brand-text-secondary">
                      {user.onboarding_completed ? "Done" : "Pending"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex rounded-full bg-brand-terracotta-light px-2.5 py-0.5 text-xs font-medium text-brand-terracotta">
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-brand-text-secondary">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                  {user.email === currentUid ? (
                    <span className="text-xs text-brand-text-muted">You</span>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.uid, e.target.value as UserRole)
                      }
                      disabled={loading === user.uid}
                      className="rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs text-brand-text focus:border-brand-terracotta focus:outline-none disabled:opacity-50"
                    >
                      <option value="user">User</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </td>
              </tr>

              {/* Expanded row */}
              {expandedUid === user.uid && (
                <tr key={`${user.uid}-expanded`}>
                  <td
                    colSpan={7}
                    className="border-t border-brand-border bg-brand-bg-warm px-5 py-4"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Interests */}
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
                          Interests
                        </p>
                        {user.interests.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {user.interests.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-brand-surface px-2.5 py-0.5 text-xs text-brand-text-secondary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-brand-text-muted">
                            No interests selected.
                          </p>
                        )}
                      </div>

                      {/* PRD / Proposal */}
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
                          {user.track === "research"
                            ? "Research Proposal"
                            : "PRD Document"}
                        </p>
                        {user.prd_document ? (
                          <div className="max-h-40 overflow-y-auto rounded-lg border border-brand-border bg-brand-surface p-3 text-xs leading-relaxed text-brand-text-secondary">
                            {user.prd_document}
                          </div>
                        ) : (
                          <p className="text-xs text-brand-text-muted">
                            Not submitted yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="py-8 text-center text-sm text-brand-text-muted">
          No users match the current filters.
        </div>
      )}
    </div>
  );
}
