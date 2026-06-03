import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/admin/Field";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/admin/batches")({
  component: BatchesAdmin,
});

type Batch = {
  id: string;
  batch_name: string;
  age_group: string;
  days: string;
  start_time: string;
  end_time: string;
  coach_id: string | null;
  location: string | null;
  notes: string | null;
  monthly_fee: number | null;
  display_order: number;
  active: boolean;
};

type Coach = { id: string; name: string };

function BatchesAdmin() {
  const [list, setList] = useState<Batch[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const empty = { batch_name: "", age_group: "", days: "", start_time: "06:00", end_time: "09:00", coach_id: "", location: "", notes: "", monthly_fee: "", display_order: "0" };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from("batch_schedules").select("*").order("display_order"),
      supabase.from("coaches").select("id,name").order("name"),
    ]);
    setList((s ?? []) as Batch[]);
    setCoaches((c ?? []) as Coach[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.batch_name.trim() || !form.age_group.trim() || !form.days.trim()) return toast.error("Name, age, days required");
    const { error } = await supabase.from("batch_schedules").insert({
      batch_name: form.batch_name.trim(),
      age_group: form.age_group.trim(),
      days: form.days.trim(),
      start_time: form.start_time,
      end_time: form.end_time,
      coach_id: form.coach_id || null,
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
      monthly_fee: form.monthly_fee ? Number(form.monthly_fee) : 0,
      display_order: Number(form.display_order) || 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Batch published");
    setForm(empty);
    load();
  };

  const toggleActive = async (s: Batch) => {
    const { error } = await supabase.from("batch_schedules").update({ active: !s.active }).eq("id", s.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this batch?")) return;
    const { error } = await supabase.from("batch_schedules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const assignCoach = async (batchId: string, coachId: string) => {
    const { error } = await supabase.from("batch_schedules").update({ coach_id: coachId || null }).eq("id", batchId);
    if (error) return toast.error(error.message);
    toast.success("Coach assigned");
    load();
  };

  return (
    <div>
      <PageHeader eyebrow="[ Batches ]" title="Batches" />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="space-y-3 border border-border p-6">
          <h2 className="font-display text-2xl">Create Batch</h2>
          <Field label="Batch name" required value={form.batch_name} onChange={(v) => setForm({ ...form, batch_name: v })} />
          <Field label="Age group" required value={form.age_group} onChange={(v) => setForm({ ...form, age_group: v })} placeholder="U-14" />
          <Field label="Days" required value={form.days} onChange={(v) => setForm({ ...form, days: v })} placeholder="Mon · Wed · Fri" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start" type="time" value={form.start_time} onChange={(v) => setForm({ ...form, start_time: v })} />
            <Field label="End" type="time" value={form.end_time} onChange={(v) => setForm({ ...form, end_time: v })} />
          </div>
          <div className="space-y-2">
            <Label>Assigned coach</Label>
            <select value={form.coach_id} onChange={(e) => setForm({ ...form, coach_id: e.target.value })} className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm">
              <option value="">— None —</option>
              {coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <Field label="Monthly fee (₹)" type="number" value={form.monthly_fee} onChange={(v) => setForm({ ...form, monthly_fee: v })} />
          <Field label="Display order" type="number" value={form.display_order} onChange={(v) => setForm({ ...form, display_order: v })} />
          <Button type="submit" className="w-full">Create</Button>
        </form>

        <div className="space-y-3">
          <h2 className="font-display text-2xl">All Batches ({list.length})</h2>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {list.map((s) => (
            <div key={s.id} className="border border-border p-4 flex justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">{s.age_group}</div>
                <div className="font-display text-lg">{s.batch_name}{!s.active && " · HIDDEN"}</div>
                <div className="text-xs">{s.days} · {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}</div>
                {s.location && <div className="text-xs text-muted-foreground">{s.location}</div>}
                {s.monthly_fee ? <div className="text-xs">₹{s.monthly_fee}/mo</div> : null}
                <div className="mt-2">
                  <select
                    value={s.coach_id ?? ""}
                    onChange={(e) => assignCoach(s.id, e.target.value)}
                    className="w-full h-8 border border-input bg-transparent rounded-md px-2 text-xs"
                  >
                    <option value="">— No coach —</option>
                    {coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => toggleActive(s)}>{s.active ? "Hide" : "Show"}</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
