import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Clock, Users, CalendarDays, Target, CheckCircle2, Building2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Container, Loading, Panel, SampleBadge, SkillChips, StatusBadge, MatchMeter, EmptyState } from "@/components/app/ui-bits";
import { useAuth } from "@/lib/auth";
import { scoreMatch } from "@/lib/matching";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({
    meta: [
      { title: "Project details — JengaLink" },
      { name: "description", content: "Community project details, required skills and how to apply." },
      { property: "og:title", content: "Community project — JengaLink" },
      { property: "og:description", content: "See the skills needed and apply to volunteer." },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const { user, role, profile } = useAuth();
  const qc = useQueryClient();
  const [motivation, setMotivation] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: p, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => (await supabase.from("projects").select("*, organizations(*)").eq("id", id).maybeSingle()).data,
  });
  const myApp = useQuery({
    queryKey: ["myapp", id, user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("applications").select("*").eq("project_id", id).eq("volunteer_id", user!.id).maybeSingle()).data,
  });

  if (isLoading) return <Loading />;
  if (!p) return <Container><EmptyState title="Project not found" body="It may have been removed or is not published yet." action={<Button asChild><Link to="/projects">Browse projects</Link></Button>} /></Container>;

  const isOwner = !!user && p.organizations?.owner_id === user.id;
  const match = role === "volunteer" && profile ? scoreMatch({ volunteer: profile, project: p }) : null;

  async function apply() {
    if (motivation.trim().length < 20) return void toast.error("Tell the coordinator a little more (at least 20 characters).");
    setBusy(true);
    const { error } = await supabase.from("applications").insert({ project_id: id, volunteer_id: user!.id, motivation: motivation.trim() });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Application submitted!");
    qc.invalidateQueries({ queryKey: ["myapp", id] });
  }
  async function report() {
    const reason = window.prompt("Why are you reporting this project?");
    if (!reason || reason.trim().length < 5) return;
    const { error } = await supabase.from("reports").insert({ reporter_id: user!.id, target_type: "project", target_id: id, reason: reason.trim().slice(0, 1000) });
    if (error) toast.error(error.message); else toast.success("Report sent to administrators.");
  }

  return (
    <Container>
      <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground">← All projects</Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="animate-rise">
            <div className="flex flex-wrap items-center gap-2"><Badge variant="soft">{p.category}</Badge><StatusBadge status={p.status} />{p.is_sample && <SampleBadge />}</div>
            <h1 className="mt-3 text-3xl font-semibold">{p.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-muted-foreground"><Building2 className="h-4 w-4" />{p.organizations?.name}{p.organizations?.verified && <Badge variant="success" className="ml-1">Verified</Badge>}</p>
          </div>
          <Panel title="About this project">
            <p className="text-foreground/90">{p.summary}</p>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{p.description}</p>
          </Panel>
          <Panel title="Required skills"><SkillChips skills={p.required_skills} highlight={match?.matchedSkills} /></Panel>
          {match && (
            <Panel title="Why you match">
              <MatchMeter score={match.score} />
              <ul className="mt-3 space-y-1.5 text-sm">
                {match.reasons.map((r) => <li key={r} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />{r}</li>)}
                {match.missingSkills.length > 0 && <li className="text-muted-foreground">Skills to build: {match.missingSkills.join(", ")}</li>}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">Score = skills (60) + interest in category (20) + availability (10) + same city (10).</p>
            </Panel>
          )}
        </div>
        <aside className="space-y-4">
          <Panel>
            <dl className="space-y-3 text-sm">
              <Row icon={<MapPin />} k="Location" v={p.location} />
              <Row icon={<Clock />} k="Duration" v={p.duration_text} />
              <Row icon={<CalendarDays />} k="Commitment" v={p.commitment ?? "—"} />
              <Row icon={<Users />} k="Volunteers needed" v={String(p.volunteers_needed)} />
              {p.beneficiaries_target > 0 && <Row icon={<Target />} k="Target beneficiaries" v={String(p.beneficiaries_target)} />}
              {p.start_date && <Row icon={<CalendarDays />} k="Dates" v={`${p.start_date} → ${p.end_date ?? "TBD"}`} />}
            </dl>
          </Panel>
          <Panel title={isOwner ? "You manage this project" : "Apply"}>
            {isOwner ? (
              <Button asChild className="w-full"><Link to="/manage/$projectId" params={{ projectId: p.id }}>Open project workspace</Link></Button>
            ) : !user ? (
              <Button asChild className="w-full"><Link to="/auth" search={{ mode: "register", redirect: `/projects/${p.id}` }}>Sign up to apply</Link></Button>
            ) : role !== "volunteer" ? (
              <p className="text-sm text-muted-foreground">Only volunteer accounts can apply to projects.</p>
            ) : p.is_sample ? (
              <p className="text-sm text-muted-foreground">This is a sample listing for demonstration and is not accepting applications.</p>
            ) : myApp.data ? (
              <div className="space-y-2 text-sm"><div className="flex items-center gap-2">Your application: <StatusBadge status={myApp.data.status} /></div>
                <Button asChild variant="outline" className="w-full"><Link to="/applications">Track applications</Link></Button></div>
            ) : p.status !== "open" ? (
              <p className="text-sm text-muted-foreground">This project is not accepting applications.</p>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="mot">Why do you want to join?</Label>
                <Textarea id="mot" rows={4} maxLength={2000} value={motivation} onChange={(e) => setMotivation(e.target.value)} placeholder="Share relevant skills and experience…" />
                <Button className="w-full" onClick={apply} disabled={busy}>Submit application</Button>
              </div>
            )}
          </Panel>
          {user && !isOwner && <button onClick={report} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"><Flag className="h-3 w-3" /> Report this project</button>}
        </aside>
      </div>
    </Container>
  );
}

function Row({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-primary [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <div><dt className="text-muted-foreground">{k}</dt><dd className="font-medium capitalize text-foreground">{v}</dd></div>
    </div>
  );
}
