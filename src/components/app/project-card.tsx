import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SampleBadge, SkillChips, MatchMeter } from "./ui-bits";

export type ProjectWithOrg = {
  id: string; title: string; summary: string; category: string; location: string; required_skills: string[];
  volunteers_needed: number; duration_text: string; is_sample: boolean; status: string;
  organizations: { name: string; verified: boolean } | null;
};

export function ProjectCard({ p, match, matched = [] }: { p: ProjectWithOrg; match?: number; matched?: string[] }) {
  return (
    <Link to="/projects/$id" params={{ id: p.id }} className="group flex flex-col rounded-xl border bg-card p-5 shadow-card card-hover">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="soft">{p.category}</Badge>
        {p.is_sample && <SampleBadge />}
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">{p.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{p.organizations?.name}{p.organizations?.verified && " · Verified org"}</p>
      <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{p.summary}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.location}</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.duration_text}</span>
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{p.volunteers_needed} needed</span>
      </div>
      <div className="mt-4"><SkillChips skills={p.required_skills} highlight={matched} /></div>
      {match !== undefined && <div className="mt-4 border-t pt-3"><MatchMeter score={match} /></div>}
    </Link>
  );
}
