import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, FolderSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHeader, Loading, EmptyState } from "@/components/app/ui-bits";
import { ProjectCard, type ProjectWithOrg } from "@/components/app/project-card";
import { CATEGORIES } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { scoreMatch } from "@/lib/matching";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Community projects — JengaLink" },
      { name: "description", content: "Browse and filter community projects by skill, category and location." },
      { property: "og:title", content: "Community projects — JengaLink" },
      { property: "og:description", content: "Find a project that needs your skills." },
    ],
  }),
  component: Projects,
});

function Projects() {
  const { profile, role } = useAuth();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [loc, setLoc] = useState("all");
  const [skill, setSkill] = useState("all");
  const [bestFirst, setBestFirst] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await supabase.from("projects").select("*, organizations(name, verified)").in("status", ["open", "in_progress"]).order("is_sample").order("created_at", { ascending: false })).data ?? [],
  });

  const locations = useMemo(() => [...new Set((data ?? []).map((p) => p.location.split(",")[0]!.trim()).filter(Boolean))], [data]);
  const skills = useMemo(() => [...new Set((data ?? []).flatMap((p) => p.required_skills))].sort(), [data]);
  const isVol = role === "volunteer" && profile;

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    let rows = (data ?? []).filter((p) =>
      (!term || [p.title, p.summary, p.description, ...p.required_skills].join(" ").toLowerCase().includes(term)) &&
      (cat === "all" || p.category === cat) &&
      (loc === "all" || p.location.startsWith(loc)) &&
      (skill === "all" || p.required_skills.includes(skill)),
    ).map((p) => ({ p, m: isVol ? scoreMatch({ volunteer: profile!, project: p }) : null }));
    if (isVol && bestFirst) rows = rows.sort((a, b) => (b.m?.score ?? 0) - (a.m?.score ?? 0));
    return rows;
  }, [data, q, cat, loc, skill, isVol, profile, bestFirst]);

  return (
    <Container>
      <PageHeader title="Community projects" subtitle="Find real projects where your skills make a difference." />
      <div className="mb-6 grid gap-3 rounded-xl border bg-card p-4 shadow-card md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search projects" placeholder="Search by title or skill…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={cat} onValueChange={setCat}><SelectTrigger className="md:w-44" aria-label="Category"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All categories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <Select value={skill} onValueChange={setSkill}><SelectTrigger className="md:w-44" aria-label="Skill"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All skills</SelectItem>{skills.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <Select value={loc} onValueChange={setLoc}><SelectTrigger className="md:w-40" aria-label="Location"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All locations</SelectItem>{locations.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        {isVol && (
          <div className="flex items-center gap-2 md:col-span-4">
            <Switch id="best" checked={bestFirst} onCheckedChange={setBestFirst} />
            <Label htmlFor="best" className="text-sm text-muted-foreground">Sort by my match score</Label>
          </div>
        )}
      </div>
      {isLoading ? <Loading /> : list.length === 0 ? (
        <EmptyState icon={<FolderSearch />} title="No projects match your filters" body="Try clearing a filter or searching for a different skill." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ p, m }) => <ProjectCard key={p.id} p={p as ProjectWithOrg} match={m?.score} matched={m?.matchedSkills} />)}
        </div>
      )}
    </Container>
  );
}
