"use client";

import { useState } from "react";
import { WelcomeStep } from "./welcome-step";
import { TrackStep } from "./track-step";
import { PathStep } from "./path-step";
import { ProjectPromptStep } from "./project-prompt-step";
import { PrdSubmitStep } from "./prd-submit-step";
import { InterestsStep } from "./interests-step";
import { CompleteStep } from "./complete-step";

type Step =
  | "welcome"
  | "track"
  | "path"
  | "project-prompt"
  | "prd-submit"
  | "interests"
  | "complete";

interface OnboardingFlowProps {
  /** Called after onboarding is saved — parent refreshes its state */
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [track, setTrack] = useState<"product" | "research" | null>(null);
  const [path, setPath] = useState<"solo" | "team" | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [prdDocument, setPrdDocument] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Persist onboarding data to backend then show complete step */
  const saveOnboarding = async (
    finalInterests: string[] = interests,
    finalPrd: string = prdDocument,
  ) => {
    if (!track || !path) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          path,
          interests: finalInterests,
          prd_document: finalPrd || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed to save onboarding");
      }
      setStep("complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const progressStep =
    step === "welcome"
      ? 0
      : step === "track"
      ? 1
      : step === "path"
      ? 2
      : step === "project-prompt" || step === "interests"
      ? 3
      : step === "prd-submit"
      ? 4
      : 5;

  const totalSteps = 5;

  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Progress bar */}
      {step !== "welcome" && step !== "complete" && (
        <div className="w-full max-w-xl mb-8">
          <div className="h-1.5 w-full rounded-full bg-brand-border overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-terracotta transition-all duration-500 ease-out"
              style={{ width: `${(progressStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="w-full max-w-2xl">
        {step === "welcome" && (
          <WelcomeStep onNext={() => setStep("track")} />
        )}

        {step === "track" && (
          <TrackStep
            onSelect={(t) => {
              setTrack(t);
              setStep("path");
            }}
          />
        )}

        {step === "path" && track && (
          <PathStep
            track={track}
            onSelect={(p) => {
              setPath(p);
              setStep(p === "solo" ? "project-prompt" : "interests");
            }}
            onBack={() => setStep("track")}
          />
        )}

        {step === "project-prompt" && track && (
          <ProjectPromptStep
            track={track}
            onComplete={() => setStep("prd-submit")}
            onBack={() => setStep("path")}
          />
        )}

        {step === "prd-submit" && track && (
          <PrdSubmitStep
            track={track}
            loading={saving}
            onComplete={(doc) => {
              setPrdDocument(doc);
              saveOnboarding([], doc);
            }}
            onSkip={() => saveOnboarding([], "")}
            onBack={() => setStep("project-prompt")}
          />
        )}

        {step === "interests" && (
          <InterestsStep
            loading={saving}
            onComplete={(i) => {
              setInterests(i);
              saveOnboarding(i);
            }}
            onBack={() => setStep("path")}
          />
        )}

        {step === "complete" && track && path && (
          <CompleteStep
            track={track}
            path={path}
            interests={interests}
            onDashboard={onComplete}
          />
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-300/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50">
          {error} — please try again.
        </div>
      )}
    </div>
  );
}
