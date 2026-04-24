"use client";

import { useState, useRef } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadedProposal {
  id: string;
  title: string;
  classification: { status: string; confidence: number; voice_rules: string[] };
}

export function ProposalUploadForm({ companyId }: { companyId: string }) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastUploaded, setLastUploaded] = useState<UploadedProposal | null>(null);
  const [proposalStatus, setProposalStatus] = useState<"won" | "lost">("won");
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("company_id", companyId);
    formData.append("status", proposalStatus);
    formData.append("title", title || file.name.replace(/\.[^.]+$/, ""));

    const res = await fetch("/api/proposals/upload", { method: "POST", body: formData });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
      setStatus("error");
      return;
    }

    const data = await res.json();
    setLastUploaded({ id: data.proposal.id, title: data.proposal.title, classification: data.classification });
    setStatus("success");
    setTitle("");
    if (fileRef.current) fileRef.current.value = "";

    setTimeout(() => setStatus("idle"), 4000);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Upload a proposal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q4 2024 — Acme Corp Rebrand"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Proposal file (PDF or DOCX)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              required
              className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-accent file:text-primary file:text-sm file:font-medium file:cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Outcome</label>
            <div className="flex gap-3">
              {(["won", "lost"] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={s}
                    checked={proposalStatus === s}
                    onChange={() => setProposalStatus(s)}
                    className="accent-primary"
                  />
                  <span className={`text-sm font-medium ${s === "won" ? "text-success" : "text-destructive"}`}>
                    {s === "won" ? "Won — deal closed" : "Lost — deal didn't close"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={status === "uploading"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {status === "uploading" ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Analyzing...
              </>
            ) : (
              "Upload & analyze"
            )}
          </button>
        </form>
      </div>

      {status === "success" && lastUploaded && (
        <div className="rounded-xl border border-success/20 bg-success/5 p-4 animate-fade-up">
          <div className="flex items-start gap-3">
            <span className="text-success text-lg">✓</span>
            <div>
              <p className="text-sm font-semibold text-foreground">{lastUploaded.title}</p>
              <p className="text-xs text-muted mt-0.5">
                Classified as <strong className="text-foreground">{lastUploaded.classification.status}</strong>{" "}
                ({Math.round(lastUploaded.classification.confidence * 100)}% confidence)
              </p>
              {lastUploaded.classification.voice_rules.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted mb-1">Voice rules extracted:</p>
                  <ul className="space-y-0.5">
                    {lastUploaded.classification.voice_rules.map((rule, i) => (
                      <li key={i} className="text-xs text-foreground">• {rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
