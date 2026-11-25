import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Menu, LogOut, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-gradient text-primary-foreground">J</span>
      Jenga<span className="-ml-2 text-primary">Link</span>
    </Link>
  );
}

export function SiteHeader() {
  const { user, role, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const notifs = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(10)).data ?? [],
  });
  const unread = (notifs.data ?? []).filter((n) => !n.read).length;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  async function markRead() {
    if (!unread) return;
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    notifs.refetch();
  }

  const links = [
    { to: "/projects", label: "Projects" },
    { to: "/impact", label: "Impact" },
    { to: "/verify", label: "Verify certificate" },
  ] as const;
  const appLinks = user
    ? role === "admin"
      ? ([{ to: "/dashboard", label: "Dashboard" }, { to: "/admin", label: "Admin" }] as const)
      : role === "coordinator"
        ? ([{ to: "/dashboard", label: "Dashboard" }, { to: "/applications", label: "Applications" }, { to: "/referrals", label: "Referrals" }] as const)
        : ([{ to: "/dashboard", label: "Dashboard" }, { to: "/passport", label: "Passport" }, { to: "/referrals", label: "Referrals" }] as const)
    : [];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {[...appLinks, ...links].map((l) => (
            <Link key={l.to} to={l.to} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <DropdownMenu onOpenChange={(o) => o && markRead()}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                    <Bell />
                    {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(notifs.data ?? []).length === 0 && <p className="px-2 py-4 text-center text-sm text-muted-foreground">You're all caught up.</p>}
                  {(notifs.data ?? []).map((n) => (
                    <DropdownMenuItem key={n.id} onClick={() => n.link && navigate({ to: n.link })} className="flex-col items-start">
                      <span className="font-medium">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{n.body}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">{profile?.full_name?.split(" ")[0] || "Account"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="capitalize">{role ?? "member"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>Edit profile</DropdownMenuItem>
                  {user && <DropdownMenuItem onClick={() => navigate({ to: "/u/$id", params: { id: user.id } })}>Public profile</DropdownMenuItem>}
                  <DropdownMenuItem onClick={signOut}><LogOut /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/auth">Log in</Link></Button>
              <Button asChild size="sm"><Link to="/auth" search={{ mode: "register" }}>Get started</Link></Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
        </div>
      </div>
      {open && (
        <nav className="border-t bg-background px-4 py-3 md:hidden">
          {[...appLinks, ...links].map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted">{l.label}</Link>
          ))}
          {user && (
            <>
              <Link to="/settings" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted">Edit profile</Link>
              <button onClick={signOut} className="block w-full rounded-md px-3 py-2.5 text-left text-sm text-destructive hover:bg-muted">Sign out</button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="font-display text-lg font-semibold">JengaLink</div>
          <p className="mt-2 text-sm opacity-70">Community projects, verified experience and professional networks for young people.</p>
        </div>
        <div className="text-sm">
          <div className="font-semibold">Platform</div>
          <ul className="mt-2 space-y-1 opacity-80">
            <li><Link to="/projects">Explore projects</Link></li>
            <li><Link to="/verify">Verify a certificate</Link></li>
            <li><Link to="/impact">Impact dashboard</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="font-semibold">Contact</div>
          <p className="mt-2 opacity-80">hello@jengalink.org</p>
          <p className="opacity-80">Built for the Local Networks & Experience track.</p>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10 py-4 text-center text-xs opacity-60">© {new Date().getFullYear()} JengaLink</div>
    </footer>
  );
}
