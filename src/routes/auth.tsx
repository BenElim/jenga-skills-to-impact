import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, HeartHandshake, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Search = { mode?: "login" | "register" | "forgot"; redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === "register" || s.mode === "forgot" ? s.mode : s.mode === "login" ? "login" : undefined,
    redirect: typeof s.redirect === "string" && s.redirect.startsWith("/") ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or register — JengaLink" },
      { name: "description", content: "Create your JengaLink account as a volunteer or organization." },
      { property: "og:title", content: "Join JengaLink" },
      { property: "og:description", content: "Register as a volunteer or organization." },
    ],
  }),
  component: AuthPage,
});

const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  org_name: z.string().trim().max(120).optional(),
});

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [tab, setTab] = useState(mode === "register" ? "register" : mode === "forgot" ? "forgot" : "login");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<"volunteer" | "coordinator">("volunteer");
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) navigate({ to: redirect ?? "/dashboard", replace: true });
  }, [ready, user, redirect, navigate]);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.get("email")).trim(), password: String(f.get("password")) });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Welcome back!");
  }

  async function onRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = registerSchema.safeParse(f);
    if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message ?? "Check the form");
    if (role === "coordinator" && (!parsed.data.org_name || parsed.data.org_name.length < 2)) return void toast.error("Enter your organization name");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: parsed.data.full_name, role, org_name: parsed.data.org_name ?? "" } },
    });
    setBusy(false);
    if (error) return void toast.error(error.message);
    if (!data.session) setSent(parsed.data.email);
  }

  async function onForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    if (!z.string().email().safeParse(email).success) return void toast.error("Enter a valid email");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Check your inbox for a reset link.");
  }

  if (sent)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="mt-2 text-muted-foreground">We sent a confirmation link to <strong>{sent}</strong>. Click it to activate your account.</p>
        <Button variant="outline" className="mt-6" onClick={() => { setSent(null); setTab("login"); }}>Back to log in</Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8 animate-rise">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={onLogin} className="mt-6 space-y-4">
              <div className="space-y-1.5"><Label htmlFor="le">Email</Label><Input id="le" name="email" type="email" required autoComplete="email" /></div>
              <div className="space-y-1.5"><Label htmlFor="lp">Password</Label><Input id="lp" name="password" type="password" required autoComplete="current-password" /></div>
              <Button className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Log in</Button>
              <button type="button" onClick={() => setTab("forgot")} className="w-full text-center text-sm text-primary">Forgot password?</button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={onRegister} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
                {([
                  { v: "volunteer", l: "Volunteer", icon: HeartHandshake },
                  { v: "coordinator", l: "Organization", icon: Building2 },
                ] as const).map((o) => (
                  <button key={o.v} type="button" role="radio" aria-checked={role === o.v} onClick={() => setRole(o.v)}
                    className={cn("flex flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-colors", role === o.v ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground hover:border-primary/50")}>
                    <o.icon className="h-5 w-5" />{o.l}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5"><Label htmlFor="rn">{role === "coordinator" ? "Your name (coordinator)" : "Full name"}</Label><Input id="rn" name="full_name" required /></div>
              {role === "coordinator" && <div className="space-y-1.5"><Label htmlFor="ro">Organization name</Label><Input id="ro" name="org_name" required /></div>}
              <div className="space-y-1.5"><Label htmlFor="re">Email</Label><Input id="re" name="email" type="email" required autoComplete="email" /></div>
              <div className="space-y-1.5"><Label htmlFor="rp">Password</Label><Input id="rp" name="password" type="password" minLength={8} required autoComplete="new-password" /></div>
              <Button className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Create account</Button>
            </form>
          </TabsContent>

          <TabsContent value="forgot">
            <form onSubmit={onForgot} className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">Enter your email and we'll send you a link to reset your password.</p>
              <div className="space-y-1.5"><Label htmlFor="fe">Email</Label><Input id="fe" name="email" type="email" required /></div>
              <Button className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Send reset link</Button>
              <button type="button" onClick={() => setTab("login")} className="w-full text-center text-sm text-primary">Back to log in</button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">By continuing you agree to use JengaLink responsibly. <Link to="/" className="text-primary">Home</Link></p>
    </div>
  );
}
