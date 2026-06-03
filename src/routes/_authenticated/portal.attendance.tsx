import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal/attendance")({
  component: MyAttendance,
});

type Row = { id: string; session_date: string; status: string };

function MyAttendance() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: s } = await supabase.from("students").select("id").eq("user_id", uid).maybeSingle();
      if (!s) { setLoading(false); return; }
      const { data } = await supabase.from("attendance").select("id,session_date,status").eq("student_id", (s as { id: string }).id).order("session_date", { ascending: false }).limit(100);
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const total = rows.length;
  const present = rows.filter((r) => r.status === "present").length;
  const pct = total ? Math.round((present / total) * 100) : 0;

  return (
    <div>
      <PageHeader eyebrow="[ Attendance ]" title="My Attendance" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && total === 0 && <p className="text-sm text-muted-foreground">No attendance records yet. Ask the admin to link your account to a student profile.</p>}
      {total > 0 && (
        <>
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            <div className="border border-border p-4"><div className="text-xs font-mono uppercase text-primary">Total Sessions</div><div className="font-display text-3xl">{total}</div></div>
            <div className="border border-border p-4"><div className="text-xs font-mono uppercase text-primary">Present</div><div className="font-display text-3xl">{present}</div></div>
            <div className="border border-border p-4"><div className="text-xs font-mono uppercase text-primary">Attendance %</div><div className="font-display text-3xl">{pct}%</div></div>
          </div>
          <ul className="divide-y divide-border text-sm">
            {rows.map((r) => (
              <li key={r.id} className="py-2 flex justify-between">
                <span>{r.session_date}</span>
                <span className="font-mono uppercase text-xs">{r.status}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
