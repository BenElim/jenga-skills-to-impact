import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Role = "admin" | "coordinator" | "volunteer";
type AuthCtx = {
  user: User | null;
  ready: boolean;
  roles: Role[];
  role: Role | null;
  profile: Tables<"profiles"> | null;
  org: Tables<"organizations"> | null;
  refresh: () => void;
};
const Ctx = createContext<AuthCtx>({ user: null, ready: false, roles: [], role: null, profile: null, org: null, refresh: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
      if (event === "SIGNED_OUT") qc.clear();
      else if (event === "SIGNED_IN" || event === "USER_UPDATED") qc.invalidateQueries();
    });
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, [qc]);

  const me = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = user!.id;
      const [r, p, o] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("organizations").select("*").eq("owner_id", uid).maybeSingle(),
      ]);
      return { roles: (r.data ?? []).map((x) => x.role as Role), profile: p.data, org: o.data };
    },
  });
  const roles = me.data?.roles ?? [];
  const role: Role | null = roles.includes("admin") ? "admin" : roles.includes("coordinator") ? "coordinator" : roles.includes("volunteer") ? "volunteer" : null;

  return (
    <Ctx.Provider value={{ user, ready: ready && (!user || !me.isLoading), roles, role, profile: me.data?.profile ?? null, org: me.data?.org ?? null, refresh: () => me.refetch() }}>
      {children}
    </Ctx.Provider>
  );
}
export const useAuth = () => useContext(Ctx);
