import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/coach/performance")({
  component: CoachPerformance,
});

type Student = { id: string; name: string };
type Note = { id: string; student_id: string; rating: number | null; remarks: string | null; created_at: string };

function CoachPerformance() {
  const [coachId, setCoachId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [form, setForm] = useState({ student_id: "", rating: "4", remarks: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
    const { data: c } = await supabase.from("coaches").select("id").eq("user_id", uid).maybeSingle();
    if (!c) { setLoading(false); return; }
    const cid = (c as { id: string }).id;
    setCoachId(cid);
    const { data: b } = await supabase.from("batch_schedules").select("id").eq("coach_id", cid);
    const batchIds = (b ?? []).map((x: { id: string }) => x.id);
    if (batchIds.length) {
      const [{ data: s }, { data: n }] = await Promise.all([
        supabase.from("students").select("id,name").in("batch_id", batchIds).order("name"),
        supabase.from("performance_notes").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setStudents((s ?? []) as Student[]);
      setNotes((n ?? []) as Note[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.student_id) return toast.error("Pick a student");
    const { error } = await supabase.from("performance_notes").insert({
      student_id: form.student_id,
      coach_id: coachId,
      rating: Number(form.rating),
      remarks: form.remarks.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Note added");
    setForm({ student_id: "", rating: "4", remarks: "" });
    load();
  };

  const sname = (id: string) => students.find((s) => s.id === id)?.name ?? id.slice(0, 8);

  return (
    <div>
      <PageHeader eyebrow="[ Performance ]" title="Performance Notes" />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="space-y-3 border border-border p-6">
          <h2 className="font-display text-2xl">Add Note</h2>
          <div className="space-y-2">
            <Label>Student *</Label>
            <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm" required>
              <option value="">— Select —</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Rating (1–5)</Label>
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm">
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Remarks</Label>
            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={4} className="w-full border border-input bg-transparent rounded-md px-3 py-2 text-sm" />
          </div>
          <Button type="submit" className="w-full">Add Note</Button>
        </form>

        <div>
          <h2 className="font-display text-2xl mb-3">Recent Notes</h2>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="border border-border p-3 text-sm">
                <div className="flex justify-between">
                  <div className="font-display">{sname(n.student_id)}</div>
                  <div className="font-mono text-xs text-primary">{"★".repeat(n.rating ?? 0)}</div>
                </div>
                {n.remarks && <p className="text-xs text-muted-foreground mt-1">{n.remarks}</p>}
                <div className="text-[10px] font-mono text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
