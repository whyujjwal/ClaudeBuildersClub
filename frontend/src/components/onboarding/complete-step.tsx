"use client";

interface CompleteStepProps {
  track: "product" | "research";
  path: "solo" | "team";
  interests: string[];
  onDashboard: () => void;
}

const TRACK_LABEL = { product: "Product Development", research: "Research" };
const PATH_LABEL = { solo: "Working solo", team: "Joining a team" };

export function CompleteStep({
  track,
  path,
  interests,
  onDashboard,
}: CompleteStepProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto py-4">
      {/* Celebration graphic */}
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-terracotta-light ring-2 ring-brand-terracotta/20">
          <span className="text-5xl select-none">🎉</span>
        </div>
        {/* Orbiting dots */}
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-terracotta opacity-60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-brand-terracotta opacity-40 animate-bounce" style={{ animationDelay: "200ms" }} />
        <div className="absolute top-2 -left-3 h-2 w-2 rounded-full bg-brand-terracotta opacity-30 animate-bounce" style={{ animationDelay: "400ms" }} />
      </div>

      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight text-brand-text">
          You&apos;re all set!
        </h2>
        <p className="text-brand-text-secondary">
          Your profile is ready. Here&apos;s what we&apos;ve saved for you.
        </p>
      </div>

      {/* Summary card */}
      <div className="w-full rounded-2xl border border-brand-border bg-brand-surface p-6 text-left space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-brand-text-muted">Track</span>
          <span className="rounded-full bg-brand-terracotta-light px-3 py-0.5 text-sm font-medium text-brand-terracotta">
            {TRACK_LABEL[track]}
          </span>
        </div>
        <div className="border-t border-brand-border" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-brand-text-muted">Working style</span>
          <span className="rounded-full bg-brand-terracotta-light px-3 py-0.5 text-sm font-medium text-brand-terracotta">
            {PATH_LABEL[path]}
          </span>
        </div>
        {interests.length > 0 && (
          <>
            <div className="border-t border-brand-border" />
            <div className="space-y-2">
              <span className="text-sm text-brand-text-muted">Interests</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {interests.map((i) => (
                  <span
                    key={i}
                    className="rounded-full bg-brand-terracotta-light px-2.5 py-0.5 text-xs font-medium text-brand-terracotta"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {path === "solo" && (
        <p className="text-sm text-brand-text-secondary bg-brand-bg-warm rounded-xl px-5 py-3 border border-brand-border">
          💡 Remember to paste your Claude prompt into{" "}
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-terracotta underline underline-offset-2 hover:text-brand-terracotta-hover"
          >
            claude.ai
          </a>{" "}
          to start building your{" "}
          {track === "product" ? "PRD" : "research proposal"}.
        </p>
      )}

      <button
        onClick={onDashboard}
        className="w-full rounded-xl bg-brand-terracotta px-6 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:bg-brand-terracotta-hover active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50"
      >
        Go to Dashboard →
      </button>
    </div>
  );
}
