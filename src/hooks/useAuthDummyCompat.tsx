import { useDummyAuth } from "@/hooks/useDummyAuth";
// Compatibility layer: keeps existing route/components working by exposing
// a similar shape to the original `useAuth` (user + loading + auth actions).
export function useAuthDummyCompat() {
  const { user, loading, signOut, signIn, signUp } = useDummyAuth();

  return {
    user: user
      ? {
          id: user.id,
          email: user.email,
        }
      : null,
    loading,
    signOut,
    signIn,
    signUp,
  };
}
