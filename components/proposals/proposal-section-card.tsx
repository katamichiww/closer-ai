type SectionStatus = "pending" | "streaming" | "complete";

interface ProposalSectionCardProps {
  title: string;
  status: SectionStatus;
  content: string;
  isActive: boolean;
}

export function ProposalSectionCard({ title, status, content, isActive }: ProposalSectionCardProps) {
  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        status === "complete"
          ? "border-border bg-card"
          : isActive
          ? "border-primary/40 bg-accent"
          : "border-border/50 bg-card/50"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
        <h3 className={`text-sm font-semibold ${status === "pending" ? "text-muted" : "text-foreground"}`}>
          {title}
        </h3>
        <StatusIndicator status={status} />
      </div>

      {(status === "streaming" || status === "complete") && content && (
        <div className="px-5 py-4">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
          {status === "streaming" && (
            <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse-dot" />
          )}
        </div>
      )}

      {status === "pending" && (
        <div className="px-5 py-3">
          <div className="h-3 w-3/4 rounded bg-border/60" />
        </div>
      )}
    </div>
  );
}

function StatusIndicator({ status }: { status: SectionStatus }) {
  if (status === "complete") {
    return (
      <span className="flex items-center gap-1 text-xs text-success font-medium">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Done
      </span>
    );
  }
  if (status === "streaming") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
        <span className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "0ms" }} />
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "200ms" }} />
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "400ms" }} />
        </span>
        Writing
      </span>
    );
  }
  return <span className="text-xs text-muted">Pending</span>;
}
