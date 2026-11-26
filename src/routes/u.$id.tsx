import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, GraduationCap, Award, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Container, Loading, Panel, SkillChips, EmptyState } from "@/components/app/ui-bits";

export const Route = createFileRoute("/u/$id")({
  head: () => ({ meta: [{ title: "Volunteer profile — JengaLink" }, { name: "description", content: "Verified experience and endorsements on JengaLink." }, { property: "og:title", content: "Volunteer profile — JengaLink" }, { property: "og:description", content: "Verified experience and endorsements." }] }),
  component: PublicProfile,
});

function PublicProfile() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["public-profile", id],
    queryFn: async () => {
      const [p, c, e] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.rpc("public_certificates", { _volunteer: id }),
        supabase.from("endorsements").select("*, endorser:profiles!endorsements_endorser_id_fkey(full_name), projects(title)").eq("volunteer_id", id).order("created_at", { ascending: false }),
      ]);
      return { p: p.data, certs: c.data ?? [], ends: e.data ?? [] };
    },
  });
  if (q.isLoading) return <Loading />;
  const d = q.data;
  if (!d?.p) return <Container><EmptyState title="Profile not found" /></Container>;
  const { p } = d;
  return (
    <Container className="max-w-4xl">
      <div className="rounded-2xl bg-hero p-8 text-navy-foreground shadow-lift animate-rise">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-gradient font-display text-2xl font-semibold">{(p.full_name || "?").charAt(0)}</div>
          <div>
            <h1 className="text-2xl font-semibold">{p.full_name || "JengaLink member"}</h1>
            {p.headline && <p className="opacity-80">{p.headline}</p>}
            <div className="mt-1 flex flex-wrap gap-3 text-sm opacity-70">
              {p.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.location}</span>}
              {p.education && <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{p.education}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Panel title="About">{p.bio ? <p className="text-sm text-foreground/80">{p.bio}</p> : <p className="text-sm text-muted-foreground">No bio yet.</p>}
          {p.skills.length > 0 && <div className="mt-4"><div className="mb-2 text-sm text-muted-foreground">Skills</div><SkillChips skills={p.skills} /></div>}
        </Panel>
        <Panel title="Verified experience">
          {d.certs.length === 0 ? <p className="text-sm text-muted-foreground">No verified certificates yet.</p> : (
            <ul className="space-y-3">{d.certs.map((c) => (
              <li key={c.verification_code} className="flex items-start gap-3">
                <Award className="mt-0.5 h-5 w-5 text-primary" />
                <div className="text-sm"><div className="font-medium">{c.role_title} · {c.project_title}</div><div className="text-muted-foreground">{c.org_name} · {Number(c.total_hours)} hrs</div>
                  <Link to="/verify/$code" params={{ code: c.verification_code }} className="text-xs text-primary">Verify {c.verification_code}</Link></div>
              </li>))}</ul>
          )}
        </Panel>
      </div>
      <Panel title="Endorsements" className="mt-6">
        {d.ends.length === 0 ? <p className="text-sm text-muted-foreground">No endorsements yet.</p> : (
          <div className="grid gap-4 md:grid-cols-2">{d.ends.map((e) => (
            <figure key={e.id} className="rounded-lg bg-secondary p-4">
              <Quote className="h-4 w-4 text-primary" />
              <blockquote className="mt-2 text-sm">{e.message}</blockquote>
              <figcaption className="mt-3 text-xs text-muted-foreground"><strong className="text-foreground">{e.endorser?.full_name}</strong> · {e.relationship}{e.projects?.title ? ` · ${e.projects.title}` : ""}{e.skill ? ` · Skill: ${e.skill}` : ""}</figcaption>
            </figure>))}</div>
        )}
      </Panel>
    </Container>
  );
}
