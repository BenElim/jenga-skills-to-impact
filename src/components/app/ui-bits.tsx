import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-rise">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10", className)}>{children}</div>;
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" /> {label}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      {icon && <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">{icon}</div>}
      <h3 className="font-semibold text-foreground">{title}</h3>
      {body && <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const statusMap: Record<string, "soft" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning", accepted: "success", rejected: "destructive", open: "soft", in_progress: "warning",
  completed: "success", draft: "secondary", todo: "secondary", verified: "success", declined: "destructive",
  approved: "success", revoked: "destructive", resolved: "success", dismissed: "secondary",
};
export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusMap[status] ?? "secondary"} className="capitalize">{status.replace("_", " ")}</Badge>;
}

export function SampleBadge() {
  return <Badge variant="sample">Sample data</Badge>;
}

export function StatCard({ label, value, icon, hint }: { label: string; value: ReactNode; icon?: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold text-foreground">{value}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, actions, className }: { title?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 shadow-card", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function SkillChips({ skills, highlight = [] }: { skills: string[]; highlight?: string[] }) {
  const hl = new Set(highlight.map((s) => s.toLowerCase()));
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <Badge key={s} variant={hl.has(s.toLowerCase()) ? "default" : "soft"}>{s}</Badge>
      ))}
    </div>
  );
}

export function MatchMeter({ score }: { score: number }) {
  const tone = score >= 70 ? "bg-success" : score >= 40 ? "bg-warning" : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-semibold text-foreground">{score}% match</span>
    </div>
  );
}
