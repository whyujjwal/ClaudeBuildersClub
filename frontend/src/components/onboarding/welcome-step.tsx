"use client";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto py-8">
      {/* Logo mark */}
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-terracotta-light ring-1 ring-brand-terracotta/20">
        <svg
          width="40"
          height="40"
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

      {/* Heading */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-brand-text">
          Welcome to Claude Builders Club
        </h1>
        <p className="text-lg text-brand-text-secondary leading-relaxed">
          A community for builders and researchers using Claude to create
          something meaningful.
        </p>
      </div>

      {/* Feature list */}
      <div className="w-full space-y-3 rounded-xl border border-brand-border bg-brand-surface p-6 text-left">
        {[
          {
            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            text: "Work on product ideas or research projects with Claude",
          },
          {
            icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
            text: "Collaborate with other builders or work solo",
          },
          {
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
            text: "Get a tailored Claude prompt to kick off your PRD or research proposal",
          },
        ].map((item) => (
          <div key={item.text} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D97757"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={item.icon} />
              </svg>
            </div>
            <p className="text-sm text-brand-text-secondary">{item.text}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-brand-text-muted">
        Takes about 2 minutes to set up
      </p>

      <button
        onClick={onNext}
        className="w-full rounded-xl bg-brand-terracotta px-6 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:bg-brand-terracotta-hover active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50"
      >
        Get Started →
      </button>
    </div>
  );
}
