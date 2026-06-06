import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/attendance")({
  component: AdminAttendance,
});

type Row = {
  id: string;
  status: string;
  session_date: string;
  student_id: string;
  batch_id: string | null;
};

function AdminAttendance() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>([]);
  const [students, setStudents] = useState<Record<string, string>>({});
  const [batches, setBatches] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: a }, { data: s }, { data: b }] = await Promise.all([
        supabase
          .from("attendance")
          .select("*")
          .eq("session_date", date)
          .order("created_at"),
        supabase.from("students").select("id,name"),
        supabase.from("batch_schedules").select("id,batch_name"),
      ]);
      setRows((a ?? []) as Row[]);
      setStudents(
        Object.fromEntries(
          ((s ?? []) as { id: string; name: string }[]).map((x) => [
            x.id,
            x.name,
          ]),
        ),
      );
      setBatches(
        Object.fromEntries(
          ((b ?? []) as { id: string; batch_name: string }[]).map((x) => [
            x.id,
            x.batch_name,
          ]),
        ),
      );
      setLoading(false);
    })();
  }, [date]);

  const counts = rows.reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  return (
    <div>
      <PageHeader eyebrow="[ Attendance ]" title="Attendance Log" />
      <div className="flex items-center gap-3 mb-6">
        <label className="font-mono text-xs uppercase tracking-widest">
          Date
        </label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="border border-border p-4">
          <div className="text-xs font-mono uppercase text-primary">
            Present
          </div>
          <div className="font-display text-3xl">{counts.present ?? 0}</div>
        </div>
        <div className="border border-border p-4">
          <div className="text-xs font-mono uppercase text-primary">Late</div>
          <div className="font-display text-3xl">{counts.late ?? 0}</div>
        </div>
        <div className="border border-border p-4">
          <div className="text-xs font-mono uppercase text-primary">Absent</div>
          <div className="font-display text-3xl">{counts.absent ?? 0}</div>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No attendance recorded for this date.
        </p>
      )}
      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="border border-border p-3 flex justify-between text-sm"
          >
            <div>
              <div className="font-display">
                {students[r.student_id] ?? r.student_id.slice(0, 8)}
              </div>
              <div className="text-xs text-muted-foreground">
                {r.batch_id ? batches[r.batch_id] : "—"}
              </div>
            </div>
            <div className="font-mono text-xs uppercase tracking-widest self-center">
              {r.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
