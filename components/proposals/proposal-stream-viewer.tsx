"use client";

import { useState, useCallback } from "react";
import { ProposalSectionCard } from "./proposal-section-card";
import type { GenerationEvent, ProposalSection } from "@/types/generation";
import { PROPOSAL_SECTIONS } from "@/types/generation";
import Link from "next/link";

const SECTION_LABELS: Record<ProposalSection, string> = {
  executive_summary: "Executive Summary",
  understanding_of_needs: "Understanding of Needs",
  proposed_approach: "Proposed Approach",
  deliverables: "Deliverables",
  timeline: "Timeline",
  pricing: "Pricing",
  why_us: "Why Us",
  next_steps: "Next Steps",
};

interface SectionState {
  status: "pending" | "streaming" | "complete";
  content: string;
}

type ViewerStatus = "idle" | "generating" | "complete" | "error";

export function ProposalStreamViewer({
  prospectId,
  prospectName,
}: {
  prospectId: string;
  prospectName: string;
}) {
  const [viewerStatus, setViewerStatus] = useState<ViewerStatus>("idle");
  const [sections, setSections] = useState<Partial<Record<ProposalSection, SectionState>>>({});
  const [activeSection, setActiveSection] = useState<ProposalSection | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [sparkpageUrl, setSparkpageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setViewerStatus("generating");
    setSections({});
    setProposalId(null);
    setSparkpageUrl(null);
    setErrorMessage(null);

    const currentSection = { name: "" as ProposalSection, buffer: "" };

    const response = await fetch("/api/proposals/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospect_id: prospectId }),
    });

    if (!response.body) {
      setErrorMessage("No response stream");
      setViewerStatus("error");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event: GenerationEvent = JSON.parse(line.slice(6));

          if (event.type === "section_start") {
            const section = event.section as ProposalSection;
            currentSection.name = section;
            currentSection.buffer = "";
            setActiveSection(section);
            setSections((prev) => ({
              ...prev,
              [section]: { status: "streaming", content: "" },
            }));
          } else if (event.type === "text_delta") {
            currentSection.buffer += event.text;
            const buf = currentSection.buffer;
            const sec = currentSection.name;
            setSections((prev) => ({
              ...prev,
              [sec]: { status: "streaming", content: buf },
            }));
          } else if (event.type === "section_complete") {
            const section = event.section as ProposalSection;
            setSections((prev) => ({
              ...prev,
              [section]: { status: "complete", content: event.content },
            }));
          } else if (event.type === "generation_complete") {
            setProposalId(event.proposal_id);
            setSparkpageUrl(event.sparkpage_url);
            setActiveSection(null);
            setViewerStatus("complete");
          } else if (event.type === "error") {
            setErrorMessage(event.message);
            setViewerStatus("error");
          }
        } catch {
          // Partial JSON line — skip
        }
      }
    }
  }, [prospectId]);

  return (
    <div>
      {viewerStatus === "idle" && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted mb-1">Ready to generate a proposal for</p>
          <p className="text-lg font-semibold text-foreground mb-6">{prospectName}</p>
          <p className="text-xs text-muted mb-6 max-w-md mx-auto">
            Closer AI will retrieve your best winning proposals, research this prospect, and generate a
            brand-perfect proposal in under 5 minutes.
          </p>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            ⚡ Generate proposal
          </button>
        </div>
      )}

      {(viewerStatus === "generating" || viewerStatus === "complete") && (
        <div className="space-y-1">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">
                {viewerStatus === "generating" ? "Generating..." : "Complete"}
              </span>
              <span className="text-xs text-muted">
                {Object.values(sections).filter((s) => s.status === "complete").length} / {PROPOSAL_SECTIONS.length} sections
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${(Object.values(sections).filter((s) => s.status === "complete").length / PROPOSAL_SECTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {PROPOSAL_SECTIONS.map((section) => {
            const state = sections[section];
            return (
              <ProposalSectionCard
                key={section}
                title={SECTION_LABELS[section]}
                status={state?.status ?? "pending"}
                content={state?.content ?? ""}
                isActive={activeSection === section}
              />
            );
          })}
        </div>
      )}

      {viewerStatus === "complete" && (
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          {proposalId && (
            <Link
              href={`/proposals/${proposalId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              View full proposal →
            </Link>
          )}
          {sparkpageUrl && (
            <a
              href={sparkpageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
            >
              Open Sparkpage ↗
            </a>
          )}
          <button
            onClick={generate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
          >
            Regenerate
          </button>
        </div>
      )}

      {viewerStatus === "error" && (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{errorMessage ?? "Generation failed. Please try again."}</p>
          <button
            onClick={generate}
            className="mt-3 text-sm text-destructive underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
