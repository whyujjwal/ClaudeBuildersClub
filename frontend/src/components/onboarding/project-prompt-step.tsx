"use client";

import { useState } from "react";

const PROMPTS: Record<"product" | "research", string> = {
  product: `I'm starting a new product and need your help creating a detailed PRD.
Please interview me step by step using Claude's question format. Ask me ONE question at a time about:

1. What problem am I solving and for whom?
2. What's my core value proposition?
3. Who are my target users? (demographics, behaviors, pain points)
4. What are the must-have features for v1?
5. What's the tech stack I'm considering?
6. What are my success metrics?
7. What's my timeline and constraints?
8. Who are my competitors?

After gathering all answers, produce a structured PRD document with:
Executive Summary, Problem Statement, Target Users, Feature Requirements (prioritized), Technical Architecture, Success Metrics, Timeline, and Risks.`,

  research: `I'm starting a research project and need your help creating a detailed research proposal.
Please interview me step by step. Ask me ONE question at a time about:

1. What is my research question or hypothesis?
2. What domain does this fall under?
3. What existing work or literature am I building on?
4. What methodology am I planning to use?
5. What data or resources do I need?
6. What are my expected outcomes?
7. What's my timeline?
8. How will I measure success or validate results?

After gathering all answers, produce a structured research proposal with:
Abstract, Background & Motivation, Research Questions, Methodology, Data Requirements, Expected Outcomes, Timeline, and References to explore.`,
};

interface ProjectPromptStepProps {
  track: "product" | "research";
  onComplete: () => void;
  onBack: () => void;
}

export function ProjectPromptStep({
  track,
  onComplete,
  onBack,
}: ProjectPromptStepProps) {
  const [copied, setCopied] = useState(false);
  const prompt = PROMPTS[track];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select the textarea
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-brand-terracotta uppercase tracking-wider">
          Step 3 of 3
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-text">
          Your Claude starter prompt
        </h2>
        <p className="text-brand-text-secondary">
          Copy this prompt and paste it into{" "}
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-terracotta underline underline-offset-2 hover:text-brand-terracotta-hover"
          >
            claude.ai
          </a>{" "}
          to begin your{" "}
          {track === "product" ? "product PRD" : "research proposal"}.
        </p>
      </div>

      {/* Prompt box */}
      <div className="relative rounded-2xl border border-brand-border bg-brand-surface overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand-border bg-brand-bg-warm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
            <div className="h-3 w-3 rounded-full bg-green-400/60" />
          </div>
          <span className="text-xs text-brand-text-muted font-mono">
            {track === "product" ? "prd-prompt.txt" : "research-prompt.txt"}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all duration-150 bg-brand-terracotta-light text-brand-terracotta hover:bg-brand-terracotta hover:text-white"
          >
            {copied ? (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="p-5 text-sm text-brand-text-secondary font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-72 overflow-y-auto">
          {prompt}
        </pre>
      </div>

      {/* Big copy button */}
      <button
        onClick={handleCopy}
        className="w-full rounded-xl border-2 border-brand-terracotta/30 bg-brand-terracotta-light px-6 py-3.5 text-base font-semibold text-brand-terracotta transition-all duration-150 hover:bg-brand-terracotta hover:text-white hover:border-brand-terracotta active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50"
      >
        {copied ? "✓ Copied to clipboard!" : "Copy Prompt"}
      </button>

      <button
        onClick={onComplete}
        className="w-full rounded-xl bg-brand-terracotta px-6 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:bg-brand-terracotta-hover active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50"
      >
        I&apos;ve got my {track === "product" ? "PRD" : "Research Proposal"} →
      </button>

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
