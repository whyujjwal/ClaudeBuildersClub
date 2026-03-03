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
  prd_document: string | null;
}

interface DashboardClientProps {
  user: UserData;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();

  if (!user.onboarding_completed) {
    return (
      <OnboardingFlow onComplete={() => router.refresh()} />
    );
  }

  const firstName = user.name.split(" ")[0];
  const trackLabel = user.track === "product" ? "Product Development" : "Research";
  const trackEmoji = user.track === "product" ? "🛠" : "🔬";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4">
      {/* Greeting */}
      <div className="space-y-3">
        <h1 className="text-5xl font-bold tracking-tight text-brand-text">
          Welcome to Day 1, {firstName} 👋
        </h1>
        <p className="text-xl text-brand-text-secondary">
          Your{" "}
          <span className="text-brand-terracotta font-semibold">
            {trackEmoji} {trackLabel}
          </span>{" "}
          journey starts now.
        </p>
      </div>

      {/* Cooking card */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface px-10 py-10 space-y-5 max-w-sm w-full">
        <div className="text-7xl animate-bounce">🍳</div>
        <h2 className="text-2xl font-bold text-brand-text">Cooking…</h2>
        <p className="text-brand-text-secondary text-sm leading-relaxed">
          We&apos;re building out the dashboard. Check back soon — something
          great is on the way.
        </p>
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-brand-terracotta opacity-80 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>

      {/* PRD snippet if saved */}
      {user.prd_document && (
        <div className="w-full max-w-xl rounded-xl border border-brand-border bg-brand-surface p-5 text-left space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-brand-terracotta">📄</span>
            <span className="text-sm font-semibold text-brand-text">
              Your saved {user.track === "product" ? "PRD" : "Research Proposal"}
            </span>
          </div>
          <p className="text-xs text-brand-text-muted font-mono whitespace-pre-wrap line-clamp-6 overflow-hidden">
            {user.prd_document}
          </p>
        </div>
      )}
    </div>
  );
}
