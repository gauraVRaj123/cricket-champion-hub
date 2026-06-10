import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useDummyAuth } from "@/hooks/useDummyAuth";
import {
  fetchActiveBatches,
  filterBatchesForCoach,
  type BatchRow,
} from "@/lib/batches";
import { fetchStudentsForBatches } from "@/lib/me";

export const Route = createFileRoute("/_authenticated/coach/attendance")({
  component: CoachAttendance,
});

type Status = "present" | "absent" | "late";
type Student = { id: string; name: string; batch_id: string | null };

function CoachAttendance() {
  const { user } = useDummyAuth();
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const all = await fetchActiveBatches();
      const mine = filterBatchesForCoach(all, user?.full_name);
      setBatches(mine);
      if (mine[0]) setBatchId(mine[0].id);
      const rows = await fetchStudentsForBatches(mine.map((b) => b.id));
      setStudents(
        (rows as Student[]).map((r) => ({
          id: r.id,
          name: r.name,
          batch_id: r.batch_id,
        })),
      );
    })();
  }, [user?.full_name]);

  const batchStudents = students.filter((s) => s.batch_id === batchId);

  // Load existing marks for the selected batch + date
  useEffect(() => {
    if (!batchId || !date) return;
    (async () => {
      const { data } = await supabase
        .from("attendance")
        .select("student_id,status")
        .eq("batch_id", batchId)
        .eq("session_date", date);
      const m: Record<string, Status> = {};
      (data ?? []).forEach((r: { student_id: string; status: string }) => {
        m[r.student_id] = r.status as Status;
      });
      setMarks(m);
    })();
  }, [batchId, date]);

  const set = (id: string, status: Status) =>
    setMarks((prev) => ({ ...prev, [id]: status }));

  const save = async () => {
    if (!batchId) return toast.error("Pick a batch");
    if (batchStudents.length === 0) return toast.error("No students in batch");
    setSaving(true);
    const rows = batchStudents.map((s) => ({
      student_id: s.id,
      batch_id: batchId,
      session_date: date,
      status: marks[s.id] ?? "present",
    }));
    const { error } = await supabase
      .from("attendance")
      .upsert(rows, { onConflict: "student_id,session_date" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Attendance saved");
  };

  return (
    <div>
      <PageHeader eyebrow="[ Attendance ]" title="Mark Attendance">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </PageHeader>
      {batches.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          No batches assigned to you yet.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-3 mb-6 max-w-xl">
        <div className="space-y-2">
          <Label>Batch</Label>
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batch_name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      {batchId && batchStudents.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No students assigned to this batch yet.
        </p>
      )}
      <div className="space-y-2">
        {batchStudents.map((s) => {
          const cur = marks[s.id] ?? "present";
          return (
            <div key={s.id} className="border border-border p-3 flex justify-between items-center gap-3">
              <div className="font-display">{s.name}</div>
              <div className="flex gap-1">
                {(["present", "late", "absent"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => set(s.id, st)}
                    className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border ${cur === st ? "bg-foreground text-background border-foreground" : "border-border"}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}