import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-claude-text">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-claude-text-muted">
          Here&apos;s an overview of your Claude Builders Club activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Projects", value: "0", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
          { label: "API Calls", value: "0", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
          { label: "Members", value: "1", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
          { label: "Uptime", value: "100%", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-claude-border bg-claude-surface p-6 transition-all duration-200 hover:border-claude-orange/30 hover:shadow-lg hover:shadow-claude-orange/5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-claude-text-muted">{stat.label}</p>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E8733A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={stat.icon} />
              </svg>
            </div>
            <p className="mt-2 text-3xl font-bold text-claude-text">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-claude-border bg-claude-surface p-6">
        <h2 className="text-lg font-semibold text-claude-text">
          Recent Activity
        </h2>
        <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-claude-orange/10">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E8733A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <h3 className="mt-4 text-claude-text font-medium">
            No activity yet
          </h3>
          <p className="mt-1 text-sm text-claude-text-muted">
            Start building with Claude to see your activity here.
          </p>
        </div>
      </div>
    </div>
  );
}
