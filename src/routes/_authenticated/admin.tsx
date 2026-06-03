import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useUserRoles } from "@/hooks/useIsAdmin";
import { DashboardShell, Forbidden, Checking } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin · Stump & Stride" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/coaches", label: "Coaches" },
  { to: "/admin/batches", label: "Batches" },
  { to: "/admin/attendance", label: "Attendance" },
  { to: "/admin/fees", label: "Fees" },
  { to: "/admin/users", label: "Users & Roles" },
];

function AdminLayout() {
  const { isAdmin, isCoach, isStudent, checking } = useUserRoles();
  if (checking) return <Checking />;
  if (!isAdmin) {
    return (
      <Forbidden
        role="Admins"
        links={[
          ...(isCoach ? [{ to: "/coach", label: "→ Coach dashboard" }] : []),
          ...(isStudent ? [{ to: "/portal", label: "→ Student portal" }] : []),
          { to: "/", label: "← Home" },
        ]}
      />
    );
  }
  return (
    <DashboardShell role="ADMIN" title="Academy Control" items={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
