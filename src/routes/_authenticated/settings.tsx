import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHeader, Panel, Loading } from "@/components/app/ui-bits";
import { TagInput } from "@/components/app/tag-input";
import { useAuth } from "@/lib/auth";
import { AVAILABILITY, CATEGORIES, SKILL_SUGGESTIONS } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Edit profile — JengaLink" }, { name: "description", content: "Update your skills, education and interests." }] }),
  component: Settings,
});

const schema = z.object({ full_name: z.string().trim().min(2, "Name is too short").max(100), headline: z.string().max(140), bio: z.string().max(1500), location: z.string().max(120), education: z.string().max(200) });

function Settings() {
  const { profile, org, role, refresh, user } = useAuth();
  const [f, setF] = useState<null | { full_name: string; headline: string; bio: string; location: string; education: string; skills: string[]; interests: string[]; availability: string }>(null);
  const [o, setO] = useState({ name: "", description: "", location: "", website: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (profile && !f) setF({ full_name: profile.full_name, headline: profile.headline ?? "", bio: profile.bio ?? "", location: profile.location ?? "", education: profile.education ?? "", skills: profile.skills, interests: profile.interests, availability: profile.availability ?? "weekends" });
    if (org) setO({ name: org.name, description: org.description ?? "", location: org.location ?? "", website: org.website ?? "" });
  }, [profile, org]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!f) return <Loading />;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse(f);
    if (!p.success) return void toast.error(p.error.issues[0]?.message ?? "Check the form");
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ ...f!, updated_at: new Date().toISOString() }).eq("id", user!.id);
    let err = error;
    if (!err && org) {
      if (o.name.trim().length < 2) { setBusy(false); return void toast.error("Organization name is too short"); }
      err = (await supabase.from("organizations").update({ name: o.name.trim().slice(0, 120), description: o.description.slice(0, 2000), location: o.location.slice(0, 120), website: o.website.slice(0, 200) }).eq("id", org.id)).error;
    }
    setBusy(false);
    if (err) return void toast.error(err.message);
    toast.success("Profile saved");
    refresh();
  }
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f!, [k]: e.target.value });

  return (
    <Container className="max-w-3xl">
      <PageHeader title="Your profile" subtitle="This information powers project matching and your public profile." />
      <form onSubmit={save} className="space-y-6">
        <Panel title="Personal">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="n">Full name</Label><Input id="n" value={f.full_name} onChange={set("full_name")} /></div>
            <div className="space-y-1.5"><Label htmlFor="h">Headline</Label><Input id="h" value={f.headline} onChange={set("headline")} placeholder="e.g. ICT student & community trainer" /></div>
            <div className="space-y-1.5"><Label htmlFor="lo">Location</Label><Input id="lo" value={f.location} onChange={set("location")} placeholder="Nairobi, Kenya" /></div>
            <div className="space-y-1.5"><Label htmlFor="ed">Education</Label><Input id="ed" value={f.education} onChange={set("education")} placeholder="BSc IT, University of Nairobi" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="b">Bio</Label><Textarea id="b" rows={3} value={f.bio} onChange={set("bio")} /></div>
          </div>
        </Panel>
        {role !== "coordinator" && (
          <Panel title="Skills & interests">
            <div className="space-y-4">
              <div className="space-y-1.5"><Label htmlFor="sk">Skills</Label><TagInput id="sk" value={f.skills} onChange={(v) => setF({ ...f, skills: v })} suggestions={SKILL_SUGGESTIONS} /></div>
              <div className="space-y-1.5"><Label htmlFor="in">Interests (project categories)</Label><TagInput id="in" value={f.interests} onChange={(v) => setF({ ...f, interests: v })} suggestions={CATEGORIES} /></div>
              <div className="space-y-1.5"><Label>Availability</Label>
                <Select value={f.availability} onValueChange={(v) => setF({ ...f, availability: v })}><SelectTrigger className="sm:w-60"><SelectValue /></SelectTrigger><SelectContent>{AVAILABILITY.map((a) => <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </Panel>
        )}
        {org && (
          <Panel title="Organization">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="on">Name</Label><Input id="on" value={o.name} onChange={(e) => setO({ ...o, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="ol">Location</Label><Input id="ol" value={o.location} onChange={(e) => setO({ ...o, location: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="ow">Website</Label><Input id="ow" value={o.website} onChange={(e) => setO({ ...o, website: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="od">About</Label><Textarea id="od" rows={3} value={o.description} onChange={(e) => setO({ ...o, description: e.target.value })} /></div>
            </div>
          </Panel>
        )}
        <Button size="lg" disabled={busy}>Save profile</Button>
      </form>
    </Container>
  );
}
