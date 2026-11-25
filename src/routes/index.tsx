import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, Handshake, BadgeCheck, Share2, Users, Building2, FolderKanban, Award, ShieldCheck, Network, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCard, type ProjectWithOrg } from "@/components/app/project-card";
import hero from "@/assets/hero-volunteers.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JengaLink — Your skills can build communities" },
      { name: "description", content: "Connect with community projects, contribute your skills, gain verified experience and build professional networks." },
      { property: "og:title", content: "JengaLink — Your skills can build communities" },
      { property: "og:description", content: "Gain verified experience through real community projects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

type Stats = { volunteers: number; organizations: number; active_projects: number; certificates: number };

function Landing() {
  const projects = useQuery({
    queryKey: ["featured"],
    queryFn: async () => (await supabase.from("projects").select("*, organizations(name, verified)").eq("status", "open").order("created_at", { ascending: false }).limit(3)).data ?? [],
  });
  const stats = useQuery({ queryKey: ["stats"], queryFn: async () => (await supabase.rpc("platform_stats")).data as unknown as Stats });

  const steps = [
    { icon: Search, t: "Discover", d: "Find community projects that match your skills, interests and availability." },
    { icon: Handshake, t: "Contribute", d: "Get accepted, receive tasks from coordinators and do real work." },
    { icon: BadgeCheck, t: "Get verified", d: "Coordinators verify your work and JengaLink issues a certificate." },
    { icon: Share2, t: "Get referred", d: "Share your verification link and earn endorsements from supervisors." },
  ];
  const benefits = [
    { icon: ShieldCheck, t: "Credible references", d: "Every certificate carries a unique code anyone can check." },
    { icon: Sparkles, t: "Smart matching", d: "Transparent scores explain exactly why you fit a project." },
    { icon: Network, t: "Real networks", d: "Endorsements from supervisors who saw your work first-hand." },
    { icon: Building2, t: "For organizations", d: "Recruit, manage tasks and verify volunteers in one place." },
  ];

  return (
    <div>
      <section className="bg-hero text-navy-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-rise">
            <Badge variant="hero-badge" className="mb-5">Local Networks & Experience</Badge>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Your Skills Can Build Communities. <span className="text-teal-soft">Your Experience Can Build Your Future.</span></h1>
            <p className="mt-5 max-w-xl text-lg opacity-80">Connect with community projects, contribute your skills, gain verified experience and build professional networks through JengaLink.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg"><Link to="/auth" search={{ mode: "register" }}>Get Started <ArrowRight /></Link></Button>
              <Button asChild variant="hero-outline" size="lg"><Link to="/projects">Explore Projects</Link></Button>
            </div>
          </div>
          <div className="relative animate-rise [animation-delay:150ms]">
            <img src={hero} alt="Young volunteers teaching digital skills in a community hall" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lift" width={1280} height={960} />
            <div className="absolute -bottom-6 left-4 right-4 flex items-center gap-3 rounded-xl bg-card p-4 text-card-foreground shadow-lift sm:left-auto sm:w-72">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success"><BadgeCheck /></span>
              <div className="text-sm"><div className="font-semibold">Experience verified</div><div className="text-muted-foreground">Code JL-XXXX-XXXX</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-semibold">How it works</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.t} className="rounded-xl border bg-card p-6 shadow-card card-hover">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground"><s.icon /></span>
                <span className="font-display text-3xl font-semibold text-muted">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold">Why JengaLink</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.t}>
                <b.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{b.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold">Featured projects</h2>
          <Link to="/projects" className="text-sm font-medium text-primary">View all →</Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(projects.data ?? []).map((p) => <ProjectCard key={p.id} p={p as ProjectWithOrg} />)}
        </div>
      </section>

      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold">Live platform numbers</h2>
          <p className="mt-1 text-sm opacity-70">Counted from real activity on JengaLink. Sample listings are excluded from project counts.</p>
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Users, l: "Volunteers", v: stats.data?.volunteers },
              { icon: Building2, l: "Organizations", v: stats.data?.organizations },
              { icon: FolderKanban, l: "Active projects", v: stats.data?.active_projects },
              { icon: Award, l: "Certificates issued", v: stats.data?.certificates },
            ].map((s) => (
              <div key={s.l}>
                <s.icon className="h-5 w-5 text-teal-soft" />
                <div className="mt-2 font-display text-4xl font-semibold">{s.v ?? "—"}</div>
                <div className="text-sm opacity-70">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-center gap-3"><h2 className="text-3xl font-semibold">What people say</h2><Badge variant="sample">Demo testimonials</Badge></div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { q: "My certificate code helped an employer confirm my training experience in minutes.", n: "Amina W. (demo persona)", r: "Volunteer, Nairobi" },
            { q: "We filled our digital literacy team in two days and verifying work was effortless.", n: "Peter O. (demo persona)", r: "Coordinator, youth CBO" },
            { q: "The match explanation showed me which skills to build next.", n: "Brian K. (demo persona)", r: "Student volunteer" },
          ].map((t) => (
            <figure key={t.n} className="rounded-xl border bg-card p-6 shadow-card">
              <blockquote className="text-foreground">“{t.q}”</blockquote>
              <figcaption className="mt-4 text-sm"><div className="font-semibold">{t.n}</div><div className="text-muted-foreground">{t.r}</div></figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
