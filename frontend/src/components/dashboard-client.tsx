"use client";

import { useRouter } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

interface UserData {
  uid: string;
  name: string;
  email: string;
  picture: string;
  onboarding_completed: boolean;
  track: "product" | "research" | null;
  path: "solo" | "team" | null;
  interests: string[];
}

interface DashboardClientProps {
  user: UserData;
}

const TRACK_LABEL: Record<string, string> = {
  product: "Product Development",
  research: "Research",
};

const PATH_LABEL: Record<string, string> = {
  solo: "Solo project",
  team: "Joined a team",
};

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();

  if (!user.onboarding_completed) {
    return (
      <OnboardingFlow
        onComplete={() => router.refresh()}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-brand-text">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-brand-text-secondary">
          Here&apos;s an overview of your Claude Builders Club activity.
        </p>
      </div>

      {/* Profile summary */}
      <div className="flex flex-wrap gap-3">
        {user.track && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-terracotta-light px-3 py-1 text-sm font-medium text-brand-terracotta">
            {user.track === "product" ? "🛠" : "🔬"} {TRACK_LABEL[user.track]}
          </span>
        )}
        {user.path && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-terracotta-light px-3 py-1 text-sm font-medium text-brand-terracotta">
            {user.path === "solo" ? "💡" : "🤝"} {PATH_LABEL[user.path]}
          </span>
        )}
        {user.interests.map((i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-sm text-brand-text-secondary"
          >
            {i}
          </span>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Projects",
            value: "0",
            icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
          },
          {
            label: "API Calls",
            value: "0",
            icon: "M13 10V3L4 14h7v7l9-11h-7z",
          },
          {
            label: "Members",
            value: "1",
            icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
          },
          {
            label: "Uptime",
            value: "100%",
            icon: "M22 12h-4l-3 9L9 3l-3 9H2",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-brand-border bg-brand-surface p-6 transition-all duration-200 hover:border-brand-terracotta/30 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-brand-text-muted">{stat.label}</p>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D97757"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={stat.icon} />
              </svg>
            </div>
            <p className="mt-2 text-3xl font-bold text-brand-text">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-brand-border bg-brand-surface p-6">
        <h2 className="text-lg font-semibold text-brand-text">
          Recent Activity
        </h2>
        <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-terracotta-light">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D97757"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <h3 className="mt-4 text-brand-text font-medium">No activity yet</h3>
          <p className="mt-1 text-sm text-brand-text-muted">
            Start building with Claude to see your activity here.
          </p>
        </div>
      </div>
    </div>
  );
}
