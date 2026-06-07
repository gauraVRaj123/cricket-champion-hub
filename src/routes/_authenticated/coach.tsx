import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useUserRoles } from "@/hooks/useIsAdmin";
import {
  DashboardShell,
  Forbidden,
  Checking,
} from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({ meta: [{ title: "Coach Dashboard · Stump & Stride" }] }),
  component: CoachLayout,
});

const NAV = [
  { to: "/coach", label: "Dashboard" },
  { to: "/coach/batches", label: "Batches" },
  { to: "/coach/today", label: "Today's Sessions" },
  { to: "/coach/students", label: "Students" },
  { to: "/coach/attendance", label: "Attendance" },
  { to: "/coach/performance", label: "Performance" },
  { to: "/coach/matches", label: "Matches" },
  { to: "/coach/messages", label: "Messages" },
  { to: "/coach/schedule", label: "Schedule" },
];

function CoachLayout() {
  const { isCoach, isAdmin, isStudent, checking } = useUserRoles();
  if (checking) return <Checking />;
  if (!isCoach) {
    return (
      <Forbidden
        role="Coaches"
        links={[
          ...(isAdmin ? [{ to: "/admin", label: "→ Admin dashboard" }] : []),
          ...(isStudent ? [{ to: "/portal", label: "→ Student portal" }] : []),
          { to: "/", label: "← Home" },
        ]}
      />
    );
  }
  return (
    <DashboardShell role="COACH" title="Coach Hub" items={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
