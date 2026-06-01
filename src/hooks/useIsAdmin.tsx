import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Role = "admin" | "coach" | "student";

export function useUserRoles() {
  const { user, loading } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setRoles([]);
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (!cancelled) {
        setRoles(((data ?? []) as { role: Role }[]).map((r) => r.role));
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return {
    roles,
    isAdmin: roles.includes("admin"),
    isCoach: roles.includes("coach"),
    isStudent: roles.includes("student"),
    checking: checking || loading,
  };
}

export function useIsAdmin() {
  const { isAdmin, checking } = useUserRoles();
  return { isAdmin, checking };
}

export function useIsCoach() {
  const { isCoach, checking } = useUserRoles();
  return { isCoach, checking };
}