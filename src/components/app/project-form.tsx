import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { TagInput } from "./tag-input";
import { Panel } from "./ui-bits";
import { AVAILABILITY, CATEGORIES, SKILL_SUGGESTIONS } from "@/lib/constants";

const schema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(150),
  summary: z.string().trim().min(10, "Add a one-line summary").max(300),
  description: z.string().trim().max(5000),
  location: z.string().trim().min(2, "Add a location").max(120),
  duration_text: z.string().trim().min(1).max(60),
  volunteers_needed: z.coerce.number().int().min(1).max(500),
  beneficiaries_target: z.coerce.number().int().min(0).max(1000000),
});

type P = Tables<"projects">;
const DEMO = { title: "Digital Literacy for 100 Youth", summary: "Train 100 young people in basic computer, internet and online safety skills.", description: "Over two weeks, volunteers run community training sessions covering computer basics, email, safe internet use and online job applications. Each volunteer leads a small group and tracks attendance.", category: "Education", location: "Nairobi, Kenya", required_skills: ["ICT", "Communication"], volunteers_needed: 5, duration_text: "2 weeks", commitment: "weekends", beneficiaries_target: 100 };

export function ProjectForm({ orgId, project }: { orgId: string; project?: P }) {
  const navigate = useNavigate();
  const [f, setF] = useState({
    title: project?.title ?? "", summary: project?.summary ?? "", description: project?.description ?? "", category: project?.category ?? "Education",
    location: project?.location ?? "", required_skills: project?.required_skills ?? [], volunteers_needed: project?.volunteers_needed ?? 1,
    duration_text: project?.duration_text ?? "2 weeks", commitment: project?.commitment ?? "weekends", beneficiaries_target: project?.beneficiaries_target ?? 0,
    start_date: project?.start_date ?? "", end_date: project?.end_date ?? "", status: project?.status ?? "open",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(f);
    if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message ?? "Check the form");
    if (f.required_skills.length === 0) return void toast.error("Add at least one required skill");
    if (f.start_date && f.end_date && f.end_date < f.start_date) return void toast.error("End date must be after start date");
    setBusy(true);
    const row = { ...f, ...parsed.data, org_id: orgId, start_date: f.start_date || null, end_date: f.end_date || null, status: f.status as P["status"] };
    const res = project
      ? await supabase.from("projects").update(row).eq("id", project.id).select("id").single()
      : await supabase.from("projects").insert(row).select("id").single();
    setBusy(false);
    if (res.error) return void toast.error(res.error.message);
    toast.success(project ? "Project updated" : "Project published");
    navigate({ to: "/manage/$projectId", params: { projectId: res.data.id } });
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {!project && <Button type="button" variant="outline" size="sm" onClick={() => setF({ ...f, ...DEMO })}>Fill with demo scenario</Button>}
      <Panel title="Basics">
        <div className="grid gap-4">
          <div className="space-y-1.5"><Label htmlFor="t">Title</Label><Input id="t" value={f.title} onChange={set("title")} required /></div>
          <div className="space-y-1.5"><Label htmlFor="s">Summary</Label><Input id="s" value={f.summary} onChange={set("summary")} required /></div>
          <div className="space-y-1.5"><Label htmlFor="d">Description & activities</Label><Textarea id="d" rows={5} value={f.description} onChange={set("description")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Category</Label>
              <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label htmlFor="l">Location</Label><Input id="l" value={f.location} onChange={set("location")} placeholder="City, Country" required /></div>
          </div>
        </div>
      </Panel>
      <Panel title="Team & schedule">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="sk">Required skills</Label><TagInput id="sk" value={f.required_skills} onChange={(v) => setF({ ...f, required_skills: v })} suggestions={SKILL_SUGGESTIONS} /></div>
          <div className="space-y-1.5"><Label htmlFor="vn">Volunteers needed</Label><Input id="vn" type="number" min={1} value={f.volunteers_needed} onChange={set("volunteers_needed")} /></div>
          <div className="space-y-1.5"><Label htmlFor="du">Duration</Label><Input id="du" value={f.duration_text} onChange={set("duration_text")} /></div>
          <div className="space-y-1.5"><Label>Commitment</Label>
            <Select value={f.commitment ?? "weekends"} onValueChange={(v) => setF({ ...f, commitment: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AVAILABILITY.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label htmlFor="bt">Target beneficiaries</Label><Input id="bt" type="number" min={0} value={f.beneficiaries_target} onChange={set("beneficiaries_target")} /></div>
          <div className="space-y-1.5"><Label htmlFor="sd">Start date</Label><Input id="sd" type="date" value={f.start_date} onChange={set("start_date")} /></div>
          <div className="space-y-1.5"><Label htmlFor="ed">End date</Label><Input id="ed" type="date" value={f.end_date} onChange={set("end_date")} /></div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v as P["status"] })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="draft">Draft (hidden)</SelectItem><SelectItem value="open">Open for applications</SelectItem><SelectItem value="in_progress">In progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div>
        </div>
      </Panel>
      <Button size="lg" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{project ? "Save changes" : "Publish project"}</Button>
    </form>
  );
}
