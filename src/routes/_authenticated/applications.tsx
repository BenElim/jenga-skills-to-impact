import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHeader, Loading, EmptyState, StatusBadge, MatchMeter, SkillChips } from "@/components/app/ui-bits";
import { useAuth } from "@/lib/auth";
import { scoreMatch } from "@/lib/matching";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({ meta: [{ title: "Applications — JengaLink" }, { name: "description", content: "Track and manage project applications." }] }),
  component: () => (useAuth().role === "coordinator" ? <OrgApps /> : <MyApps />),
});

function MyApps() {
  const { user } = useAuth();
  const q = useQuery({ queryKey: ["my-apps", user?.id], queryFn: async () => (await supabase.from("applications").select("*, projects(title, location, organizations(name))").eq("volunteer_id", user!.id).order("created_at", { ascending: false })).data ?? [] });
  async function withdraw(id: string) {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Application withdrawn"); q.refetch(); }
  }
  return (
    <Container className="max-w-4xl">
      <PageHeader title="My applications" subtitle="Track the status of every project you've applied to." />
      {q.isLoading ? <Loading /> : (q.data ?? []).length === 0 ? <EmptyState icon={<Inbox />} title="No applications yet" action={<Button asChild><Link to="/projects">Explore projects</Link></Button>} /> : (
        <div className="space-y-3">{q.data!.map((a) => (
          <div key={a.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div><Link to="/projects/$id" params={{ id: a.project_id }} className="font-semibold hover:text-primary">{a.projects?.title}</Link>
              <div className="text-sm text-muted-foreground">{a.projects?.organizations?.name} · Applied {new Date(a.created_at).toLocaleDateString()}</div>
              {a.coordinator_note && <div className="mt-1 text-sm">Note: {a.coordinator_note}</div>}</div>
            <div className="flex items-center gap-2"><StatusBadge status={a.status} />{a.status === "pending" && <Button size="sm" variant="ghost" onClick={() => withdraw(a.id)}>Withdraw</Button>}</div>
          </div>))}</div>
      )}
    </Container>
  );
}

export function useDecide(onDone: () => void) {
  return async (id: string, status: "accepted" | "rejected") => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(status === "accepted" ? "Volunteer accepted" : "Application rejected"); onDone(); }
  };
}

function OrgApps() {
  const { org } = useAuth();
  const [tab, setTab] = useState("pending");
  const q = useQuery({
    queryKey: ["org-apps", org?.id],
    enabled: !!org,
    queryFn: async () => (await supabase.from("applications").select("*, projects!inner(id, title, org_id, required_skills, category, commitment, location), volunteer:profiles!applications_volunteer_id_fkey(*)").eq("projects.org_id", org!.id).order("created_at", { ascending: false })).data ?? [],
  });
  const decide = useDecide(() => q.refetch());
  const rows = (q.data ?? []).filter((a) => tab === "all" || a.status === tab);
  return (
    <Container className="max-w-5xl">
      <PageHeader title="Application management" subtitle="Review volunteers across all your projects." />
      <Tabs value={tab} onValueChange={setTab} className="mb-4"><TabsList><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="accepted">Accepted</TabsTrigger><TabsTrigger value="rejected">Rejected</TabsTrigger><TabsTrigger value="all">All</TabsTrigger></TabsList></Tabs>
      {q.isLoading ? <Loading /> : rows.length === 0 ? <EmptyState icon={<Inbox />} title="Nothing here" body="New applications will appear here." /> : (
        <div className="space-y-3">{rows.map((a) => {
          const m = a.volunteer ? scoreMatch({ volunteer: a.volunteer, project: a.projects }) : null;
          return (
            <div key={a.id} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link to="/u/$id" params={{ id: a.volunteer_id }} className="font-semibold hover:text-primary">{a.volunteer?.full_name || "Volunteer"}</Link>
                  <div className="text-sm text-muted-foreground">for <Link to="/manage/$projectId" params={{ projectId: a.project_id }} className="text-primary">{a.projects.title}</Link></div>
                </div>
                <div className="flex items-center gap-2">{m && <MatchMeter score={m.score} />}<StatusBadge status={a.status} /></div>
              </div>
              {a.volunteer && a.volunteer.skills.length > 0 && <div className="mt-3"><SkillChips skills={a.volunteer.skills} highlight={m?.matchedSkills} /></div>}
              <p className="mt-3 text-sm text-foreground/80">“{a.motivation}”</p>
              {a.status === "pending" && <div className="mt-3 flex gap-2"><Button size="sm" variant="success" onClick={() => decide(a.id, "accepted")}>Accept</Button><Button size="sm" variant="outline" onClick={() => decide(a.id, "rejected")}>Reject</Button></div>}
            </div>
          );
        })}</div>
      )}
    </Container>
  );
}
