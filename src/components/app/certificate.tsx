import { BadgeCheck } from "lucide-react";

export type CertData = {
  verification_code: string; volunteer_name: string; project_title: string; org_name: string; org_verified?: boolean | null;
  role_title: string; responsibilities: string[]; skills: string[]; total_hours: number; start_date: string | null; end_date: string | null;
  coordinator_statement: string | null; issued_at: string;
};

export function Certificate({ c }: { c: CertData }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-lift sm:p-10 print:shadow-none">
      <div className="absolute inset-x-0 top-0 h-2 bg-teal-gradient" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-display text-sm font-semibold uppercase tracking-widest text-primary">JengaLink</div>
          <div className="text-xs text-muted-foreground">Verified Experience Certificate</div>
        </div>
        <BadgeCheck className="h-10 w-10 text-success" />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">This certifies that</p>
      <h2 className="mt-1 text-3xl font-semibold text-foreground">{c.volunteer_name}</h2>
      <p className="mt-3 text-foreground/90">served as <strong>{c.role_title}</strong> on <strong>{c.project_title}</strong> with <strong>{c.org_name}</strong>{c.org_verified ? " (verified organization)" : ""}.</p>
      <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
        <div><div className="text-muted-foreground">Period</div><div className="font-medium">{c.start_date ?? "—"} → {c.end_date ?? "—"}</div></div>
        <div><div className="text-muted-foreground">Verified hours</div><div className="font-medium">{Number(c.total_hours)}</div></div>
        <div><div className="text-muted-foreground">Issued</div><div className="font-medium">{new Date(c.issued_at).toLocaleDateString()}</div></div>
      </div>
      {c.responsibilities.length > 0 && (
        <div className="mt-6"><div className="text-sm text-muted-foreground">Verified responsibilities</div>
          <ul className="mt-1 list-inside list-disc text-sm">{c.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul></div>
      )}
      {c.skills.length > 0 && <div className="mt-4 text-sm"><span className="text-muted-foreground">Skills demonstrated: </span>{c.skills.join(", ")}</div>}
      {c.coordinator_statement && <blockquote className="mt-4 border-l-2 border-primary pl-3 text-sm italic text-foreground/80">“{c.coordinator_statement}”</blockquote>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
        <span>Verification code: <span className="font-mono font-semibold text-foreground">{c.verification_code}</span></span>
        <span>Verify at /verify/{c.verification_code}</span>
      </div>
    </div>
  );
}
