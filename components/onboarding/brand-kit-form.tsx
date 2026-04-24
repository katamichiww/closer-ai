"use client";

import { useState } from "react";

interface Company {
  id: string;
  name: string;
  brand_kit_json: Record<string, unknown>;
  voice_guide_text: string | null;
}

export function BrandKitForm({ company }: { company: Company | null }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(company?.name ?? "");
  const [slug, setSlug] = useState("");
  const [voiceGuide, setVoiceGuide] = useState(company?.voice_guide_text ?? "");
  const [primaryColor, setPrimaryColor] = useState(
    (company?.brand_kit_json?.primary_color as string) ?? "#0f766e"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const endpoint = company ? `/api/company/${company.id}` : "/api/company/create";
    const body = company
      ? { voice_guide_text: voiceGuide, brand_kit_json: { ...company.brand_kit_json, primary_color: primaryColor } }
      : { name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), voice_guide_text: voiceGuide, brand_kit_json: { primary_color: primaryColor } };

    await fetch(endpoint, {
      method: company ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6">
      {!company && (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Company name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ANCHR AI Labs"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Workspace slug <span className="text-muted">(used in quiz URL)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="anchr-ai-labs"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Primary brand color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-border cursor-pointer"
          />
          <span className="text-sm text-muted font-mono">{primaryColor}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Voice & writing guidelines
        </label>
        <p className="text-xs text-muted mb-2">
          Describe your brand voice, tone rules, forbidden phrases, and structural preferences.
          Closer AI will apply these to every generated proposal.
        </p>
        <textarea
          value={voiceGuide}
          onChange={(e) => setVoiceGuide(e.target.value)}
          rows={8}
          placeholder={`Examples:
• Write in second person, addressing the client as "you"
• Open every proposal with the client's specific business challenge
• Use confident, direct language — avoid passive voice
• Never use buzzwords like "synergy", "leverage", or "holistic"
• Lead with outcomes, not features`}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save brand kit"}
        </button>
        {saved && <span className="text-sm text-success">Saved!</span>}
      </div>
    </form>
  );
}
