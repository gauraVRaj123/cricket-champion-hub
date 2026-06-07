import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/DashboardShell";
import { STUDENTS, type PerfNote } from "@/lib/coachDummy";

export const Route = createFileRoute("/_authenticated/coach/performance")({
  component: CoachPerformance,
});

const KEY = "coach_perf_notes";

function CoachPerformance() {
  const [notes, setNotes] = useState<PerfNote[]>([]);
  const [form, setForm] = useState({ student_id: "", rating: "4", remarks: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const save = (next: PerfNote[]) => {
    setNotes(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.student_id) return toast.error("Pick a student");
    const note: PerfNote = {
      id: crypto.randomUUID(),
      student_id: form.student_id,
      rating: Number(form.rating),
      remarks: form.remarks.trim(),
      created_at: new Date().toISOString(),
    };
    save([note, ...notes]);
    setForm({ student_id: "", rating: "4", remarks: "" });
    toast.success("Note added");
  };

  const sname = (id: string) => STUDENTS.find((s) => s.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader eyebrow="[ Performance ]" title="Performance Evaluation" />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="space-y-3 border border-border p-6">
          <h2 className="font-display text-2xl">Add Evaluation</h2>
          <div className="space-y-2">
            <Label>Student *</Label>
            <select
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm"
              required
            >
              <option value="">— Select —</option>
              {STUDENTS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Rating (1–5)</Label>
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Remarks</Label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              rows={4}
              className="w-full border border-input bg-transparent rounded-md px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" className="w-full">Add Note</Button>
        </form>
        <div>
          <h2 className="font-display text-2xl mb-3">Recent Notes</h2>
          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          )}
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="border border-border p-3 text-sm">
                <div className="flex justify-between">
                  <div className="font-display">{sname(n.student_id)}</div>
                  <div className="font-mono text-xs text-primary">{"★".repeat(n.rating)}</div>
                </div>
                {n.remarks && (
                  <p className="text-xs text-muted-foreground mt-1">{n.remarks}</p>
                )}
                <div className="text-[10px] font-mono text-muted-foreground mt-1">
                  {new Date(n.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}