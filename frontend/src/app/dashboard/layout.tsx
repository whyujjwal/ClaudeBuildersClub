import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.role ?? "user") as UserRole;

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Navigation */}
      <nav className="border-b border-brand-border bg-brand-surface px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-terracotta-light">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="#D97757"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="#D97757"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="#D97757"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-brand-text">
                Claude Builders Club
              </h1>
            </div>

            {/* Nav Links */}
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm text-brand-text-secondary hover:bg-brand-bg-warm hover:text-brand-text transition-colors"
              >
                Dashboard
              </Link>
              {role === "admin" && (
                <Link
                  href="/dashboard/admin"
                  className="rounded-lg px-3 py-2 text-sm text-brand-text-secondary hover:bg-brand-bg-warm hover:text-brand-text transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden rounded-full bg-brand-terracotta-light px-2.5 py-0.5 text-xs font-medium text-brand-terracotta sm:inline-block">
              {ROLE_LABELS[role]}
            </span>
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full ring-2 ring-brand-border"
              />
            )}
            <span className="hidden text-sm text-brand-text-secondary md:block">
              {session?.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
