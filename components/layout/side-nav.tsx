import Link from "next/link";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "⚡" },
      { href: "/prospects", label: "Prospects", icon: "👥" },
      { href: "/proposals", label: "Proposals", icon: "📄" },
    ],
  },
  {
    label: "Setup",
    items: [
      { href: "/onboarding/proposals", label: "Proposal Library", icon: "📚" },
      { href: "/onboarding/brand-kit", label: "Brand Kit", icon: "🎨" },
    ],
  },
];

export function SideNav() {
  return (
    <aside className="w-full border-b border-border bg-card px-4 py-4 md:min-h-screen md:w-60 md:border-b-0 md:border-r md:flex-shrink-0">
      <div className="mb-8 flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">Closer AI</p>
          <p className="text-[10px] text-muted mt-0.5">Proposal Intelligence</p>
        </div>
      </div>

      <nav className="space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2 px-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary"
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
