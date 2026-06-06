import { useEffect, useMemo, useState } from "react";
import { useDummyAuth } from "@/hooks/useDummyAuth";

type Role = "admin" | "coach" | "student";

export function useUserRoles() {
  const { user, loading } = useDummyAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setChecking(true);
    if (!loading) setChecking(false);
  }, [loading]);

  const roles = useMemo<Role[]>(() => {
    if (!user) return [];
    const role = user.role as Role;
    return role ? [role] : [];
  }, [user]);

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
