import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/DashboardShell";
import { BATCHES, STUDENTS } from "@/lib/coachDummy";

export const Route = createFileRoute("/_authenticated/coach/attendance")({
  component: CoachAttendance,
});

type Status = "present" | "absent" | "late";

function CoachAttendance() {
  const [batchId, setBatchId] = useState(BATCHES[0].id);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, Status>>({});

  const students = STUDENTS.filter((s) => s.batch_id === batchId);

  const set = (id: string, status: Status) =>
    setMarks((prev) => ({ ...prev, [id]: status }));

  const save = () => {
    const key = `coach_attendance_${batchId}_${date}`;
    const rows = students.map((s) => ({ id: s.id, status: marks[s.id] ?? "present" }));
    localStorage.setItem(key, JSON.stringify(rows));
    toast.success("Attendance saved");
  };

  return (
    <div>
      <PageHeader eyebrow="[ Attendance ]" title="Mark Attendance">
        <Button onClick={save}>Save</Button>
      </PageHeader>
      <div className="grid sm:grid-cols-2 gap-3 mb-6 max-w-xl">
        <div className="space-y-2">
          <Label>Batch</Label>
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm"
          >
            {BATCHES.map((b) => (
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