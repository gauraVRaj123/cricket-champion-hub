import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { fetchBatches, fmtTime, type BatchFull } from "@/lib/enrollments";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

type Recent = {
  id: string;
  batch_id: string;
  payment_status: string;
  amount_paid: number | null;
  enrolled_at: string;
  students: { name: string } | null;
  batch_schedules: { batch_name: string } | null;
};

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<BatchFull[]>([]);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [counts, setCounts] = useState({
    students: 0,
    coaches: 0,
    batches: 0,
    enrollments: 0,
  });
  const [perBatch, setPerBatch] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const [allBatches, students, coaches, enrollments, recentRows] =
        await Promise.all([
          fetchBatches(false),
          supabase
            .from("students")
            .select("id", { count: "exact", head: true })
            .eq("active", true),
          supabase
            .from("coaches")
            .select("id", { count: "exact", head: true })
            .eq("active", true),
          supabase.from("batch_enrollments").select("batch_id,payment_status"),
          supabase
            .from("batch_enrollments")
            .select(
              "id,batch_id,payment_status,amount_paid,enrolled_at,students(name),batch_schedules(batch_name)",
            )
            .order("enrolled_at", { ascending: false })
            .limit(10),
        ]);

      const paid = (enrollments.data ?? []).filter(
        (e) => e.payment_status === "paid",
      );
      const map: Record<string, number> = {};
      for (const e of paid) map[e.batch_id] = (map[e.batch_id] ?? 0) + 1;

      setBatches(allBatches);
      setPerBatch(map);
      setRecent((recentRows.data ?? []) as unknown as Recent[]);
      setCounts({
        students: students.count ?? 0,
        coaches: coaches.count ?? 0,
        batches: allBatches.filter((b) => b.active).length,
        enrollments: paid.length,
      });
      setLoading(false);
    })();
  }, []);

  const stats = [
    { label: "Total Students", value: counts.students },
    { label: "Total Coaches", value: counts.coaches },
    { label: "Active Batches", value: counts.batches },
    { label: "Paid Enrollments", value: counts.enrollments },
  ];

  return (
    <div>
      <PageHeader eyebrow="[ Overview ]" title="Academy Overview" />

      {loading && <p className="text-sm text-muted-foreground mb-4">Loading…</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-border p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
              {s.label}
            </div>
            <div className="font-display text-4xl">{s.value}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl mt-10 mb-3">Recent Enrollments</h2>
      {!loading && recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No enrollments yet.</p>
      ) : (
        <div className="border border-border divide-y divide-border">
          {recent.map((r) => (
            <div
              key={r.id}
              className="p-3 flex flex-wrap justify-between gap-2 text-sm"
            >
              <div className="font-display">{r.students?.name ?? "Student"}</div>
              <div className="text-muted-foreground text-xs self-center">
                {r.batch_schedules?.batch_name ?? "—"}
              </div>
              <div className="text-xs self-center">
                {r.amount_paid ? `₹${r.amount_paid}` : "—"}
              </div>
              <div className="text-xs text-muted-foreground self-center">
                {new Date(r.enrolled_at).toLocaleDateString()}
              </div>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.2em] self-center border px-2 py-0.5 ${
                  r.payment_status === "paid"
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {r.payment_status}
              </span>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-2xl mt-10 mb-3">Batches</h2>
      {!loading && batches.length === 0 ? (
        <p className="text-sm text-muted-foreground">No batches created yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {batches.map((b) => (
            <div key={b.id} className="border border-border p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                {b.age_group} · {b.active ? "ACTIVE" : "HIDDEN"}
              </div>
              <div className="font-display text-xl">{b.batch_name}</div>
              <div className="text-xs">
                {b.days} · {fmtTime(b.start_time)}–{fmtTime(b.end_time)}
              </div>
              <div className="text-xs text-muted-foreground">
                Coaches:{" "}
                {b.coaches_list.length
                  ? b.coaches_list.map((c) => c.name).join(", ")
                  : "Unassigned"}
              </div>
              <div className="text-xs">{perBatch[b.id] ?? 0} students enrolled</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-xs text-muted-foreground flex gap-4">
        <Link to="/admin/batches" className="text-primary hover:underline">
          Manage batches →
        </Link>
        <Link to="/admin/users" className="text-primary hover:underline">
          Manage users & roles →
        </Link>
      </div>
    </div>
  );
}
