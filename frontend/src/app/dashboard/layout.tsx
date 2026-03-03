import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Navigation */}
      <nav className="border-b border-brand-border bg-brand-surface px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
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
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-8 w-8 rounded-full ring-2 ring-brand-border"
              />
            )}
            <span className="hidden text-sm text-brand-text-secondary sm:block">
              {session?.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
