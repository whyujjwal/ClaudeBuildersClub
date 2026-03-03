"use client";

interface TrackStepProps {
  onSelect: (track: "product" | "research") => void;
}

const tracks = [
  {
    id: "product" as const,
    emoji: "🛠",
    title: "Product Development",
    description:
      "Build real products with Claude. Go from idea to a detailed PRD with features, architecture, and a launch plan.",
    tags: ["Apps", "APIs", "SaaS", "Tools"],
  },
  {
    id: "research" as const,
    emoji: "🔬",
    title: "Research",
    description:
      "Explore AI capabilities and publish your findings. Design experiments, define methodology, and generate a research proposal.",
    tags: ["Papers", "Experiments", "Analysis", "Datasets"],
  },
];

export function TrackStep({ onSelect }: TrackStepProps) {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-brand-terracotta uppercase tracking-wider">
          Step 1 of 3
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-text">
          Choose your track
        </h2>
        <p className="text-brand-text-secondary">
          What are you most interested in building?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => onSelect(track.id)}
            className="group flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface p-6 text-left transition-all duration-200 hover:border-brand-terracotta/50 hover:shadow-lg hover:shadow-brand-terracotta/5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50"
          >
            <div className="text-4xl">{track.emoji}</div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-brand-text group-hover:text-brand-terracotta transition-colors">
                {track.title}
              </h3>
              <p className="text-sm text-brand-text-secondary leading-relaxed">
                {track.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {track.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-terracotta-light px-2.5 py-0.5 text-xs font-medium text-brand-terracotta"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
