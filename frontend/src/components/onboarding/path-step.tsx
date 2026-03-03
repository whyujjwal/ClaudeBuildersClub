"use client";

interface PathStepProps {
  track: "product" | "research";
  onSelect: (path: "solo" | "team") => void;
  onBack: () => void;
}

const paths = [
  {
    id: "solo" as const,
    emoji: "💡",
    title: "Work on my own project",
    description:
      "I have an idea I want to build. Get a tailored Claude prompt to kick off your PRD or research proposal.",
    cta: "Generate my Claude prompt",
  },
  {
    id: "team" as const,
    emoji: "🤝",
    title: "Join a team",
    description:
      "I want to collaborate with others. Share your skills and interests so we can match you with the right people.",
    cta: "Find my team",
  },
];

export function PathStep({ track, onSelect, onBack }: PathStepProps) {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-brand-terracotta uppercase tracking-wider">
          Step 2 of 3
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-text">
          How do you want to work?
        </h2>
        <p className="text-brand-text-secondary">
          {track === "product"
            ? "Building solo or looking for co-founders / collaborators?"
            : "Running your own research or joining an existing project?"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {paths.map((path) => (
          <button
            key={path.id}
            onClick={() => onSelect(path.id)}
            className="group flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface p-6 text-left transition-all duration-200 hover:border-brand-terracotta/50 hover:shadow-lg hover:shadow-brand-terracotta/5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50"
          >
            <div className="text-4xl">{path.emoji}</div>
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-brand-text group-hover:text-brand-terracotta transition-colors">
                {path.title}
              </h3>
              <p className="text-sm text-brand-text-secondary leading-relaxed">
                {path.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-brand-terracotta">
              {path.cta}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-brand-text-muted hover:text-brand-text transition-colors mx-auto"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  );
}
