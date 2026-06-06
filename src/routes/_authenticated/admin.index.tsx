import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { PageHeader } from "@/components/DashboardShell";
import { useDummyAuth } from "@/hooks/useDummyAuth";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

type Stat = { label: string; value: string | number };

const DUMMY_STATS: Stat[] = [
  { label: "Total Students", value: 180 },
  { label: "Total Coaches", value: 12 },
  { label: "Active Batches", value: 24 },
  { label: "Present Today", value: 122 },
  { label: "Fees This Month", value: "₹2,40,000" },
];

function AdminDashboard() {
  const { user } = useDummyAuth();

  const name = useMemo(() => {
    return user?.full_name || "Admin Demo";
  }, [user]);

  return (
    <div>
      <PageHeader eyebrow="[ Overview ]" title={`Welcome, ${name}`} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DUMMY_STATS.map((s) => (
          <div key={s.label} className="border border-border p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
              {s.label}
            </div>
            <div className="font-display text-4xl">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-xs text-muted-foreground">
        <Link to="/admin/users" className="text-primary hover:underline inline-block">
          Manage users & roles →
        </Link>
      </div>
    </div>
  );
}
