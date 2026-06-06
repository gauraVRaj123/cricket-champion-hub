import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useUserRoles } from "@/hooks/useIsAdmin";
import {
  DashboardShell,
  Forbidden,
  Checking,
} from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Student Portal · Stump & Stride" },
      {
        name: "description",
        content: "Profile, attendance, performance, fees.",
      },
    ],
  }),
  component: PortalLayout,
});

const NAV = [
  { to: "/portal", label: "Dashboard" },
  { to: "/portal/profile", label: "Profile" },
  { to: "/portal/schedule", label: "Schedule" },
  { to: "/portal/attendance", label: "Attendance" },
  { to: "/portal/performance", label: "Performance" },
  { to: "/portal/matches", label: "Matches" },
  { to: "/portal/fees", label: "Fees" },
  { to: "/portal/resources", label: "Resources" },
  { to: "/portal/messages", label: "Messages" },
  { to: "/portal/achievements", label: "Achievements" },
];

function PortalLayout() {
  const { isStudent, isAdmin, isCoach, checking } = useUserRoles();
  if (checking) return <Checking />;
  if (!isStudent && (isAdmin || isCoach)) {
    return (
      <Forbidden
        role="Students"
        links={[
          ...(isAdmin ? [{ to: "/admin", label: "→ Admin dashboard" }] : []),
          ...(isCoach ? [{ to: "/coach", label: "→ Coach dashboard" }] : []),
          { to: "/", label: "← Home" },
        ]}
      />
    );
  }
  return (
    <DashboardShell role="STUDENT" title="My Academy" items={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
