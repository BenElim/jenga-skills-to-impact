import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, FolderKanban, CheckCircle2, Handshake, Award, Clock, HeartHandshake } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHeader, StatCard, Panel, Loading, EmptyState } from "@/components/app/ui-bits";

export const Route = createFileRoute("/impact")({
  head: () => ({ meta: [{ title: "Impact dashboard — JengaLink" }, { name: "description", content: "Live volunteer participation, projects and verified community impact on JengaLink." }, { property: "og:title", content: "JengaLink impact" }, { property: "og:description", content: "Live, verified community impact numbers." }] }),
  component: Impact,
});

export type PlatformStats = { volunteers: number; organizations: number; active_projects: number; completed_projects: number; participations: number; certificates: number; verified_hours: number; beneficiaries: number; skills: { skill: string; count: number }[]; sample_projects: number };

function Impact() {
  const { data: s, isLoading } = useQuery({ queryKey: ["stats"], queryFn: async () => (await supabase.rpc("platform_stats")).data as unknown as PlatformStats });
  if (isLoading || !s) return <Loading />;
  return (
    <Container>
      <PageHeader title="Impact dashboard" subtitle="Every number is counted live from activity on JengaLink. Sample listings are excluded." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Registered volunteers" value={s.volunteers} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Registered organizations" value={s.organizations} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Active projects" value={s.active_projects} icon={<FolderKanban className="h-4 w-4" />} />
        <StatCard label="Completed projects" value={s.completed_projects} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Volunteer participations" value={s.participations} icon={<Handshake className="h-4 w-4" />} hint="Accepted applications" />
        <StatCard label="Certificates issued" value={s.certificates} icon={<Award className="h-4 w-4" />} />
        <StatCard label="Verified volunteer hours" value={Number(s.verified_hours)} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Beneficiaries reached" value={s.beneficiaries} icon={<HeartHandshake className="h-4 w-4" />} hint="From completed project reports" />
      </div>
      <Panel title="Skills contributed (verified)" className="mt-6">
        {s.skills.length === 0 ? <EmptyState title="No verified skills yet" body="Skills appear here once coordinators issue certificates." /> : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.skills} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis type="category" dataKey="skill" width={120} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>
      <p className="mt-4 text-xs text-muted-foreground">{s.sample_projects} sample project listings are shown in the marketplace for demonstration and are not counted above.</p>
    </Container>
  );
}
