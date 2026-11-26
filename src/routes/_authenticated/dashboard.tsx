import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, CheckCircle2, ListTodo, Award, Plus, FolderKanban, Users, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHeader, StatCard, Panel, Loading, EmptyState, StatusBadge } from "@/components/app/ui-bits";
import { ProjectCard, type ProjectWithOrg } from "@/components/app/project-card";
import { useAuth } from "@/lib/auth";
import { scoreMatch } from "@/lib/matching";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — JengaLink" }, { name: "description", content: "Your JengaLink dashboard." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { role, ready } = useAuth();
  if (!ready || !role) return <Loading />;
  if (role === "admin") return <AdminHome />;
  if (role === "coordinator") return <OrgDashboard />;
  return <VolunteerDashboard />;
}

function VolunteerDashboard() {
  const { profile, user } = useAuth();
  const q = useQuery({
    queryKey: ["vol-dash", user?.id],
    queryFn: async () => {
      const [apps, tasks, certs, projects] = await Promise.all([
        supabase.from("applications").select("*, projects(title)").eq("volunteer_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("tasks").select("*, projects(title)").eq("assignee_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("certificates").select("id").eq("volunteer_id", user!.id),
        supabase.from("projects").select("*, organizations(name, verified)").eq("status", "open"),
      ]);
      return { apps: apps.data ?? [], tasks: tasks.data ?? [], certs: certs.data ?? [], projects: projects.data ?? [] };
    },
  });
  if (q.isLoading || !q.data || !profile) return <Loading />;
  const { apps, tasks, certs, projects } = q.data;
  const appliedIds = new Set(apps.map((a) => a.project_id));
  const recs = projects.filter((p) => !appliedIds.has(p.id)).map((p) => ({ p, m: scoreMatch({ volunteer: profile, project: p }) })).sort((a, b) => b.m.score - a.m.score).slice(0, 3);
  const completeness = [profile.full_name, profile.headline, profile.location, profile.education, profile.bio, profile.skills.length, profile.interests.length].filter(Boolean).length;
  const pct = Math.round((completeness / 7) * 100);
  const openTasks = tasks.filter((t) => t.status === "todo");

  return (
    <Container>
      <PageHeader title={`Hi ${profile.full_name.split(" ")[0] || "there"} 👋`} subtitle="Here's your volunteering at a glance." actions={<Button asChild><Link to="/projects">Find projects</Link></Button>} />
      {pct < 100 && (
        <Panel className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1"><div className="text-sm font-medium">Profile {pct}% complete</div><Progress value={pct} className="mt-2" /><p className="mt-2 text-xs text-muted-foreground">Add skills and interests so we can match you with the right projects.</p></div>
            <Button asChild variant="outline"><Link to="/settings">Complete profile</Link></Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={apps.length} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Accepted" value={apps.filter((a) => a.status === "accepted").length} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Open tasks" value={openTasks.length} icon={<ListTodo className="h-4 w-4" />} />
        <StatCard label="Certificates" value={certs.length} icon={<Award className="h-4 w-4" />} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="My tasks" actions={<Link to="/passport" className="text-sm text-primary">Open passport →</Link>}>
          {tasks.length === 0 ? <p className="text-sm text-muted-foreground">Tasks appear here once a coordinator assigns them.</p> : (
            <ul className="divide-y">{tasks.slice(0, 5).map((t) => <li key={t.id} className="flex items-center justify-between gap-2 py-2.5 text-sm"><div><div className="font-medium">{t.title}</div><div className="text-xs text-muted-foreground">{t.projects?.title}</div></div><StatusBadge status={t.status} /></li>)}</ul>
          )}
        </Panel>
        <Panel title="Recent applications" actions={<Link to="/applications" className="text-sm text-primary">All →</Link>}>
          {apps.length === 0 ? <p className="text-sm text-muted-foreground">You haven't applied to any projects yet.</p> : (
            <ul className="divide-y">{apps.slice(0, 5).map((a) => <li key={a.id} className="flex items-center justify-between gap-2 py-2.5 text-sm"><Link to="/projects/$id" params={{ id: a.project_id }} className="font-medium hover:text-primary">{a.projects?.title}</Link><StatusBadge status={a.status} /></li>)}</ul>
          )}
        </Panel>
      </div>
      <h2 className="mb-4 mt-10 text-xl font-semibold">Recommended for you</h2>
      {recs.length === 0 ? <EmptyState title="No open projects right now" /> : (
        <div className="grid gap-4 md:grid-cols-3">{recs.map(({ p, m }) => <ProjectCard key={p.id} p={p as ProjectWithOrg} match={m.score} matched={m.matchedSkills} />)}</div>
      )}
    </Container>
  );
}

function OrgDashboard() {
  const { org, refresh } = useAuth();
  const q = useQuery({
    queryKey: ["org-dash", org?.id],
    enabled: !!org,
    queryFn: async () => {
      const projects = (await supabase.from("projects").select("*, applications(id,status), tasks(id,status)").eq("org_id", org!.id).order("created_at", { ascending: false })).data ?? [];
      return projects;
    },
  });
  if (!org) return <Container><EmptyState icon={<Building2 />} title="No organization linked" body="Add your organization in your profile settings." /></Container>;
  if (q.isLoading) return <Loading />;
  const projects = q.data ?? [];
  const allApps = projects.flatMap((p) => p.applications);
  const allTasks = projects.flatMap((p) => p.tasks);

  async function requestVerification() {
    const { error } = await supabase.from("organizations").update({ verification_requested: true }).eq("id", org!.id);
    if (error) toast.error(error.message); else { toast.success("Verification requested. An administrator will review it."); refresh(); }
  }

  return (
    <Container>
      <PageHeader title={org.name} subtitle="Organization dashboard" actions={<Button asChild><Link to="/org/projects/new"><Plus />New project</Link></Button>} />
      <Panel className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {org.verified ? <span><Badge variant="success">Verified organization</Badge></span> : org.verification_requested ? <span>Verification pending admin review</span> : <span>Get verified so volunteers can trust your certificates.</span>}
          </div>
          {!org.verified && !org.verification_requested && <Button size="sm" variant="outline" onClick={requestVerification}>Request verification</Button>}
        </div>
      </Panel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projects" value={projects.length} icon={<FolderKanban className="h-4 w-4" />} />
        <StatCard label="Pending applications" value={allApps.filter((a) => a.status === "pending").length} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Team members" value={allApps.filter((a) => a.status === "accepted").length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Tasks awaiting verification" value={allTasks.filter((t) => t.status === "completed").length} icon={<ListTodo className="h-4 w-4" />} />
      </div>
      <h2 className="mb-4 mt-10 text-xl font-semibold">Your projects</h2>
      {projects.length === 0 ? (
        <EmptyState icon={<FolderKanban />} title="No projects yet" body="Publish your first community project to start recruiting volunteers." action={<Button asChild><Link to="/org/projects/new">Create project</Link></Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Link key={p.id} to="/manage/$projectId" params={{ projectId: p.id }} className="rounded-xl border bg-card p-5 shadow-card card-hover">
              <div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{p.title}</h3><StatusBadge status={p.status} /></div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{p.applications.filter((a) => a.status === "pending").length} pending</span>
                <span>{p.applications.filter((a) => a.status === "accepted").length}/{p.volunteers_needed} team</span>
                <span>{p.tasks.filter((t) => t.status === "verified").length}/{p.tasks.length} tasks verified</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}

function AdminHome() {
  return (
    <Container>
      <PageHeader title="Administrator" subtitle="Manage the JengaLink platform." actions={<Button asChild><Link to="/admin">Open admin console</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel title="Admin console"><p className="text-sm text-muted-foreground">Review organization verification, users, projects and reports.</p></Panel>
        <Panel title="Impact"><p className="text-sm text-muted-foreground">See live platform statistics.</p><Button asChild variant="outline" size="sm" className="mt-3"><Link to="/impact">View impact</Link></Button></Panel>
      </div>
    </Container>
  );
}
