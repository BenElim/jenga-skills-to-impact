import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — JengaLink" }, { name: "description", content: "Choose a new JengaLink password." }, { property: "og:title", content: "Reset password — JengaLink" }, { property: "og:description", content: "Choose a new password." }] }),
  component: Reset,
});

function Reset() {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const pw = String(f.get("pw"));
    if (pw.length < 8) return void toast.error("Password must be at least 8 characters");
    if (pw !== String(f.get("pw2"))) return void toast.error("Passwords don't match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-8 shadow-card">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <div className="space-y-1.5"><Label htmlFor="pw">New password</Label><Input id="pw" name="pw" type="password" required /></div>
        <div className="space-y-1.5"><Label htmlFor="pw2">Confirm password</Label><Input id="pw2" name="pw2" type="password" required /></div>
        <Button className="w-full" disabled={busy}>Update password</Button>
      </form>
    </div>
  );
}
