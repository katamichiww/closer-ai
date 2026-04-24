"use client";

import { useState } from "react";

interface QuizData {
  company_name: string;
  industry: string;
  website: string;
  project_type: string;
  budget_range: string;
  timeline: string;
  pain_points: string;
  desired_outcomes: string;
  contact_name: string;
  contact_email: string;
}

const STEPS = ["Company", "Project", "Needs", "Contact"] as const;

const INDUSTRIES = ["Technology", "E-commerce", "Healthcare", "Finance", "Education", "Real Estate", "Media", "Retail", "Manufacturing", "Other"];
const PROJECT_TYPES = ["Brand identity", "Website redesign", "Marketing strategy", "AI implementation", "Sales system", "Product launch", "Growth consulting", "Fractional CMO", "Other"];
const BUDGETS = ["Under $5k", "$5k–$15k", "$15k–$30k", "$30k–$75k", "$75k–$150k", "$150k+"];
const TIMELINES = ["ASAP (under 2 weeks)", "1 month", "2–3 months", "3–6 months", "6+ months", "Flexible"];

export function QuizShell({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<QuizData>({
    company_name: "", industry: "", website: "",
    project_type: "", budget_range: "", timeline: "",
    pain_points: "", desired_outcomes: "",
    contact_name: "", contact_email: "",
  });

  function update(field: keyof QuizData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId, quiz_data: data }),
    });
    if (res.ok) {
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center animate-fade-up">
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Thank you, {data.contact_name}!</h2>
        <p className="text-sm text-muted">
          {companyName} will be in touch shortly with a tailored proposal for {data.company_name}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white" : "bg-border text-muted"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium ${i === step ? "text-foreground" : "text-muted"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border w-6" />}
          </div>
        ))}
      </div>

      {/* Step 0: Company */}
      {step === 0 && (
        <div className="space-y-4 animate-fade-up">
          <h2 className="text-base font-semibold text-foreground">About your company</h2>
          <Field label="Company name" required>
            <input type="text" value={data.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="Acme Corp" className={inputClass} />
          </Field>
          <Field label="Industry">
            <select value={data.industry} onChange={(e) => update("industry", e.target.value)} className={inputClass}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Website">
            <input type="url" value={data.website} onChange={(e) => update("website", e.target.value)} placeholder="https://acme.com" className={inputClass} />
          </Field>
        </div>
      )}

      {/* Step 1: Project */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-up">
          <h2 className="text-base font-semibold text-foreground">About your project</h2>
          <Field label="What type of project?" required>
            <select value={data.project_type} onChange={(e) => update("project_type", e.target.value)} className={inputClass}>
              <option value="">Select type</option>
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Budget range">
            <select value={data.budget_range} onChange={(e) => update("budget_range", e.target.value)} className={inputClass}>
              <option value="">Select range</option>
              {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Timeline">
            <select value={data.timeline} onChange={(e) => update("timeline", e.target.value)} className={inputClass}>
              <option value="">Select timeline</option>
              {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
      )}

      {/* Step 2: Needs */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-up">
          <h2 className="text-base font-semibold text-foreground">Your challenges & goals</h2>
          <Field label="What challenges are you facing?" required>
            <textarea
              value={data.pain_points}
              onChange={(e) => update("pain_points", e.target.value)}
              rows={4}
              placeholder="Describe the problems you're trying to solve..."
              className={`${inputClass} resize-none`}
            />
          </Field>
          <Field label="What does success look like?">
            <textarea
              value={data.desired_outcomes}
              onChange={(e) => update("desired_outcomes", e.target.value)}
              rows={3}
              placeholder="Describe your ideal outcome..."
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>
      )}

      {/* Step 3: Contact */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-up">
          <h2 className="text-base font-semibold text-foreground">Your contact details</h2>
          <Field label="Your name" required>
            <input type="text" value={data.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="Jane Smith" className={inputClass} />
          </Field>
          <Field label="Work email" required>
            <input type="email" value={data.contact_email} onChange={(e) => update("contact_email", e.target.value)} placeholder="jane@acme.com" className={inputClass} />
          </Field>
          <div className="rounded-lg bg-accent border border-primary/20 p-3 text-xs text-primary">
            {companyName} will use this to send you a tailored proposal. No spam, ever.
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex justify-between mt-8">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="text-sm text-muted hover:text-foreground transition-colors">
            ← Back
          </button>
        ) : <div />}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !data.contact_name || !data.contact_email}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit →"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary";
