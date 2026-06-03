import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/coach/")({
  component: CoachDashboard,
});

type Coach = { id: string; name: string; role: string; certifications: string | null; experience_years: number | null };
type Batch = { id: string; batch_name: string; age_group: string; days: string; start_time: string; end_time: string; location: string | null };

function CoachDashboard() {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: c } = await supabase.from("coaches").select("*").eq("user_id", uid).maybeSingle();
      setCoach(c as Coach | null);
      if (c) {
        const { data: b } = await supabase.from("batch_schedules").select("*").eq("coach_id", c.id).order("display_order");
        setBatches((b ?? []) as Batch[]);
        const batchIds = (b ?? []).map((x: { id: string }) => x.id);
        if (batchIds.length) {
          const { count } = await supabase.from("students").select("id", { count: "exact", head: true }).in("batch_id", batchIds);
          setStudentsCount(count ?? 0);
          const today = new Date().toISOString().slice(0, 10);
          const { count: ac } = await supabase
            .from("attendance")
            .select("id", { count: "exact", head: true })
            .in("batch_id", batchIds)
            .eq("session_date", today);
          setTodayCount(ac ?? 0);
        }
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!coach) {
    return (
      <div>
        <PageHeader eyebrow="[ Coach ]" title="Welcome" />
        <div className="border border-border p-6 text-sm text-muted-foreground">
          Your account has the coach role but isn't linked to a coach profile yet. Ask the admin to set <span className="font-mono">user_id</span> on your coach record.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="[ Coach ]" title={coach.name} />
      <p className="text-sm text-muted-foreground mb-6">
        {coach.role}{coach.certifications ? ` · ${coach.certifications}` : ""}
        {coach.experience_years ? ` · ${coach.experience_years}y experience` : ""}
      </p>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-border p-6"><div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">My Batches</div><div className="font-display text-4xl">{batches.length}</div></div>
        <div className="border border-border p-6"><div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">Students</div><div className="font-display text-4xl">{studentsCount}</div></div>
        <div className="border border-border p-6"><div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">Marked Today</div><div className="font-display text-4xl">{todayCount}</div></div>
      </div>
      <h2 className="font-display text-2xl mb-3">My Batches</h2>
      <div className="space-y-3">
        {batches.length === 0 && <p className="text-sm text-muted-foreground">No batches assigned yet.</p>}
        {batches.map((s) => (
          <div key={s.id} className="border border-border p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">{s.age_group}</div>
            <div className="font-display text-xl">{s.batch_name}</div>
            <div className="text-xs">{s.days} · {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</div>
            {s.location && <div className="text-xs text-muted-foreground">{s.location}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
