import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useDummyAuth } from "@/hooks/useDummyAuth";
import {
  fetchActiveBatches,
  filterBatchesForCoach,
} from "@/lib/batches";
import { fetchStudentsForBatches, findMyCoach } from "@/lib/me";

export const Route = createFileRoute("/_authenticated/coach/performance")({
  component: CoachPerformance,
});

type Note = {
  id: string;
  student_id: string;
  rating: number | null;
  remarks: string | null;
  created_at: string;
};
type Student = { id: string; name: string };

function CoachPerformance() {
  const { user } = useDummyAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [form, setForm] = useState({ student_id: "", rating: "4", remarks: "" });

  useEffect(() => {
    (async () => {
      const [all, coach] = await Promise.all([
        fetchActiveBatches(),
        findMyCoach(user?.full_name),
      ]);
      setCoachId(coach?.id ?? null);
      const mine = filterBatchesForCoach(all, user?.full_name);
      const rows = await fetchStudentsForBatches(mine.map((b) => b.id));
      const studentList = rows.map((r) => ({ id: r.id, name: r.name })) as Student[];
      setStudents(studentList);
      if (studentList.length) {
        const { data } = await supabase
          .from("performance_notes")
          .select("*")
          .in("student_id", studentList.map((s) => s.id))
          .order("created_at", { ascending: false })
          .limit(50);
        setNotes((data ?? []) as Note[]);
      }
    })();
  }, [user?.full_name]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.student_id) return toast.error("Pick a student");
    const { data, error } = await supabase
      .from("performance_notes")
      .insert({
        student_id: form.student_id,
        coach_id: coachId,
        rating: Number(form.rating),
        remarks: form.remarks.trim() || null,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setNotes([data as Note, ...notes]);
    setForm({ student_id: "", rating: "4", remarks: "" });
    toast.success("Note added");
  };

  const sname = (id: string) => students.find((s) => s.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader eyebrow="[ Performance ]" title="Performance Evaluation" />
      {students.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          No students in your batches yet.
        </p>
      )}
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
              {students.map((s) => (
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
                  <div className="font-mono text-xs text-primary">
                    {"★".repeat(n.rating ?? 0)}
                  </div>
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