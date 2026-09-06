import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/admin/Field";
import { PageHeader } from "@/components/DashboardShell";
import {
  fetchBatches,
  fetchEnrollments,
  fmtTime,
  setBatchCoaches,
  type BatchFull,
  type CoachLite,
} from "@/lib/enrollments";

export const Route = createFileRoute("/_authenticated/admin/batches")({
  component: BatchesAdmin,
});

function CoachPicker({
  coaches,
  selected,
  toggle,
}: {
  coaches: CoachLite[];
  selected: string[];
  toggle: (id: string) => void;
}) {
  if (!coaches.length)
    return (
      <p className="text-xs text-muted-foreground">
        No coaches yet — add coaches first.
      </p>
    );
  return (
    <div className="border border-border divide-y divide-border max-h-52 overflow-auto">
      {coaches.map((c) => (
        <label
          key={c.id}
          className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selected.includes(c.id)}
            onChange={() => toggle(c.id)}
          />
          <span className="font-display">{c.name}</span>
          <span className="text-xs text-muted-foreground">{c.role}</span>
        </label>
      ))}
    </div>
  );
}

function BatchesAdmin() {
  const [list, setList] = useState<BatchFull[]>([]);
  const [coaches, setCoaches] = useState<CoachLite[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCoaches, setEditingCoaches] = useState<string | null>(null);
  const [editSelection, setEditSelection] = useState<string[]>([]);

  const empty = {
    batch_name: "",
    age_group: "",
    days: "",
    start_time: "06:00",
    end_time: "09:00",
    location: "",
    notes: "",
    monthly_fee: "",
    max_students: "",
    display_order: "0",
  };
  const [form, setForm] = useState(empty);
  const [selectedCoaches, setSelectedCoaches] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [batches, { data: c }, enrollments] = await Promise.all([
      fetchBatches(false),
      supabase.from("coaches").select("id,name,role").eq("active", true).order("name"),
      fetchEnrollments(),
    ]);
    setList(batches);
    setCoaches((c ?? []) as CoachLite[]);
    const map: Record<string, number> = {};
    for (const e of enrollments)
      if (e.payment_status === "paid")
        map[e.batch_id] = (map[e.batch_id] ?? 0) + 1;
    setCounts(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSel = (id: string) =>
    setSelectedCoaches((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.batch_name.trim() || !form.age_group.trim() || !form.days.trim())
      return toast.error("Batch name, age group and days are required");
    setSaving(true);
    const { data, error } = await supabase
      .from("batch_schedules")
      .insert({
        batch_name: form.batch_name.trim(),
        age_group: form.age_group.trim(),
        days: form.days.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
        coach_id: selectedCoaches[0] ?? null,
        location: form.location.trim() || null,
        notes: form.notes.trim() || null,
        monthly_fee: form.monthly_fee ? Number(form.monthly_fee) : 0,
        max_students: form.max_students ? Number(form.max_students) : null,
        display_order: Number(form.display_order) || 0,
      })
      .select("id")
      .maybeSingle();
    if (error || !data) {
      setSaving(false);
      return toast.error(error?.message ?? "Could not create batch");
    }
    const linkErr = await setBatchCoaches(data.id, selectedCoaches);
    setSaving(false);
    if (linkErr) return toast.error(linkErr.message);
    toast.success("Batch published");
    setForm(empty);
    setSelectedCoaches([]);
    load();
  };

  const toggleActive = async (s: BatchFull) => {
    const { error } = await supabase
      .from("batch_schedules")
      .update({ active: !s.active })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success(s.active ? "Batch hidden" : "Batch is now live");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this batch?")) return;
    const { error } = await supabase.from("batch_schedules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const saveCoaches = async (batchId: string) => {
    const err = await setBatchCoaches(batchId, editSelection);
    if (err) return toast.error(err.message);
    await supabase
      .from("batch_schedules")
      .update({ coach_id: editSelection[0] ?? null })
      .eq("id", batchId);
    toast.success("Coaches updated");
    setEditingCoaches(null);
    load();
  };

  return (
    <div>
      <PageHeader eyebrow="[ Batches ]" title="Batches" />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="space-y-3 border border-border p-6">
          <h2 className="font-display text-2xl">Create Batch</h2>
          <Field
            label="Batch name"
            required
            value={form.batch_name}
            onChange={(v) => setForm({ ...form, batch_name: v })}
          />
          <Field
            label="Age group"
            required
            value={form.age_group}
            onChange={(v) => setForm({ ...form, age_group: v })}
            placeholder="U-14"
          />
          <Field
            label="Days"
            required
            value={form.days}
            onChange={(v) => setForm({ ...form, days: v })}
            placeholder="Mon · Wed · Fri"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start"
              type="time"
              value={form.start_time}
              onChange={(v) => setForm({ ...form, start_time: v })}
            />
            <Field
              label="End"
              type="time"
              value={form.end_time}
              onChange={(v) => setForm({ ...form, end_time: v })}
            />
          </div>
          <Field
            label="Location"
            value={form.location}
            onChange={(v) => setForm({ ...form, location: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Monthly fee (₹)"
              type="number"
              value={form.monthly_fee}
              onChange={(v) => setForm({ ...form, monthly_fee: v })}
            />
            <Field
              label="Max students"
              type="number"
              value={form.max_students}
              onChange={(v) => setForm({ ...form, max_students: v })}
            />
          </div>
          <Field
            label="Display order"
            type="number"
            value={form.display_order}
            onChange={(v) => setForm({ ...form, display_order: v })}
          />
          <Field
            label="Notes"
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
          />
          <div className="space-y-2">
            <Label>Assign coaches</Label>
            <CoachPicker
              coaches={coaches}
              selected={selectedCoaches}
              toggle={toggleSel}
            />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Creating…" : "Create"}
          </Button>
        </form>

        <div className="space-y-3">
          <h2 className="font-display text-2xl">All Batches ({list.length})</h2>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && list.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No batches yet — create your first one.
            </p>
          )}
          {list.map((s) => (
            <div key={s.id} className="border border-border p-4">
              <div className="flex justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                    {s.age_group} · {s.active ? "ACTIVE" : "HIDDEN"}
                  </div>
                  <div className="font-display text-lg">{s.batch_name}</div>
                  <div className="text-xs">
                    {s.days} · {fmtTime(s.start_time)}–{fmtTime(s.end_time)}
                  </div>
                  {s.location && (
                    <div className="text-xs text-muted-foreground">{s.location}</div>
                  )}
                  <div className="text-xs">
                    {s.monthly_fee ? `₹${s.monthly_fee}/mo · ` : ""}
                    {counts[s.id] ?? 0} enrolled
                    {s.max_students ? ` / ${s.max_students}` : ""}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.coaches_list.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        No coaches assigned
                      </span>
                    ) : (
                      s.coaches_list.map((c) => (
                        <span
                          key={c.id}
                          className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
                        >
                          {c.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCoaches(editingCoaches === s.id ? null : s.id);
                      setEditSelection(s.coaches_list.map((c) => c.id));
                    }}
                  >
                    Edit Coaches
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(s)}>
                    {s.active ? "Hide" : "Show"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
                    Delete
                  </Button>
                </div>
              </div>

              {editingCoaches === s.id && (
                <div className="mt-3 space-y-2">
                  <CoachPicker
                    coaches={coaches}
                    selected={editSelection}
                    toggle={(id) =>
                      setEditSelection((sel) =>
                        sel.includes(id)
                          ? sel.filter((x) => x !== id)
                          : [...sel, id],
                      )
                    }
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveCoaches(s.id)}>
                      Save coaches
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCoaches(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
