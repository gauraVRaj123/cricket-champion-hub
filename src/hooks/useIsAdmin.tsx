import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Role = "admin" | "coach" | "student";

function useHasRole(role: Role) {
  const { user, loading } = useAuth();
  const [has, setHas] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setHas(false);
      setChecking(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", role)
        .maybeSingle();
      if (!cancelled) {
        setHas(!!data);
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading, role]);

  return { has, checking: checking || loading };
}

export function useIsAdmin() {
  const { has, checking } = useHasRole("admin");
  return { isAdmin: has, checking };
}

export function useIsCoach() {
  const { has, checking } = useHasRole("coach");
  return { isCoach: has, checking };
}