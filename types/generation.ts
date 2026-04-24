export type GenerationEventType =
  | "section_start"
  | "text_delta"
  | "section_complete"
  | "generation_complete"
  | "error";

export interface SectionStartEvent {
  type: "section_start";
  section: string;
}

export interface TextDeltaEvent {
  type: "text_delta";
  text: string;
}

export interface SectionCompleteEvent {
  type: "section_complete";
  section: string;
  content: string;
}

export interface GenerationCompleteEvent {
  type: "generation_complete";
  proposal_id: string;
  sparkpage_url: string | null;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export type GenerationEvent =
  | SectionStartEvent
  | TextDeltaEvent
  | SectionCompleteEvent
  | GenerationCompleteEvent
  | ErrorEvent;

export const PROPOSAL_SECTIONS = [
  "executive_summary",
  "understanding_of_needs",
  "proposed_approach",
  "deliverables",
  "timeline",
  "pricing",
  "why_us",
  "next_steps",
] as const;

export type ProposalSection = (typeof PROPOSAL_SECTIONS)[number];
