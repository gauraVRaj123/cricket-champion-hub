import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/coach/attendance")({
  component: CoachAttendance,
});

type Batch = { id: string; batch_name: string };
type Student = { id: string; name: string };

function CoachAttendance() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, "present" | "absent" | "late">>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: c } = await supabase.from("coaches").select("id").eq("user_id", uid).maybeSingle();
      if (!c) return;
      const { data: b } = await supabase.from("batch_schedules").select("id,batch_name").eq("coach_id", (c as { id: string }).id).order("batch_name");
      const list = (b ?? []) as Batch[];
      setBatches(list);
      if (list[0]) setBatchId(list[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!batchId) return;
    (async () => {
      setLoading(true);
      const [{ data: s }, { data: a }] = await Promise.all([
        supabase.from("students").select("id,name").eq("batch_id", batchId).eq("active", true).order("name"),
        supabase.from("attendance").select("student_id,status").eq("batch_id", batchId).eq("session_date", date),
      ]);
      setStudents((s ?? []) as Student[]);
      const m: Record<string, "present" | "absent" | "late"> = {};
      ((a ?? []) as { student_id: string; status: "present" | "absent" | "late" }[]).forEach((x) => { m[x.student_id] = x.status; });
      setMarks(m);
      setLoading(false);
    })();
  }, [batchId, date]);

  const setMark = (id: string, status: "present" | "absent" | "late") =>
    setMarks((prev) => ({ ...prev, [id]: status }));

  const save = async () => {
    if (!batchId) return;
    setSaving(true);
    const uid = (await supabase.auth.getUser()).data.user?.id ?? null;
    const rows = students.map((s) => ({
      student_id: s.id,
      batch_id: batchId,
      session_date: date,
      status: marks[s.id] ?? "present",
      marked_by: uid,
    }));
    const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,session_date" });
    if (error) toast.error(error.message);
    else toast.success("Attendance saved");
    setSaving(false);
  };

  return (
    <div>
      <PageHeader eyebrow="[ Attendance ]" title="Mark Attendance">
        <Button onClick={save} disabled={saving || !students.length}>{saving ? "Saving…" : "Save"}</Button>
      </PageHeader>
      <div className="grid sm:grid-cols-2 gap-3 mb-6 max-w-xl">
        <div className="space-y-2">
          <Label>Batch</Label>
          <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm">
            {batches.map((b) => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && students.length === 0 && <p className="text-sm text-muted-foreground">No students in this batch.</p>}
      <div className="space-y-2">
        {students.map((s) => {
          const cur = marks[s.id] ?? "present";
          return (
            <div key={s.id} className="border border-border p-3 flex justify-between items-center gap-3">
              <div className="font-display">{s.name}</div>
              <div className="flex gap-1">
                {(["present", "late", "absent"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setMark(s.id, st)}
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
