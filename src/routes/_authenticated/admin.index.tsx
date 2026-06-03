import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
        {label}
      </div>
      <div className="font-display text-4xl">{value}</div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    coaches: 0,
    batches: 0,
    presentToday: 0,
    feesThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const monthStart = today.slice(0, 7) + "-01";
      const [s, c, b, a, f] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("coaches").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("batch_schedules").select("id", { count: "exact", head: true }).eq("active", true),
        supabase
          .from("attendance")
          .select("id", { count: "exact", head: true })
          .eq("session_date", today)
          .eq("status", "present"),
        supabase.from("fee_payments").select("amount").gte("paid_on", monthStart),
      ]);
      const fees = (f.data ?? []).reduce(
        (sum: number, row: { amount: number | string }) => sum + Number(row.amount || 0),
        0,
      );
      setStats({
        students: s.count ?? 0,
        coaches: c.count ?? 0,
        batches: b.count ?? 0,
        presentToday: a.count ?? 0,
        feesThisMonth: fees,
      });
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader eyebrow="[ Overview ]" title="Dashboard" />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat label="Total Students" value={stats.students} />
          <Stat label="Total Coaches" value={stats.coaches} />
          <Stat label="Active Batches" value={stats.batches} />
          <Stat label="Present Today" value={stats.presentToday} />
          <Stat
            label="Fees This Month"
            value={`₹${stats.feesThisMonth.toLocaleString("en-IN")}`}
          />
        </div>
      )}
    </div>
  );
}
