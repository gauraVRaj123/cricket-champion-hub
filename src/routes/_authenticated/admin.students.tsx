import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/admin/Field";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/admin/students")({
  component: AdminStudents,
});

type Student = {
  id: string;
  name: string;
  age: number | null;
  parent_name: string | null;
  phone: string | null;
  email: string | null;
  batch_id: string | null;
  monthly_fee: number | null;
  joined_on: string;
  active: boolean;
  user_id: string | null;
};

type Batch = { id: string; batch_name: string; age_group: string };

function AdminStudents() {
  const [list, setList] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Student | null>(null);
  const empty = {
    name: "",
    age: "",
    parent_name: "",
    phone: "",
    email: "",
    batch_id: "",
    monthly_fee: "",
    user_id: "",
  };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: b }] = await Promise.all([
      supabase.from("students").select("*").order("name"),
      supabase.from("batch_schedules").select("id,batch_name,age_group").order("batch_name"),
    ]);
    setList((s ?? []) as Student[]);
    setBatches((b ?? []) as Batch[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name required");
    const payload = {
      name: form.name.trim(),
      age: form.age ? Number(form.age) : null,
      parent_name: form.parent_name.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      batch_id: form.batch_id || null,
      monthly_fee: form.monthly_fee ? Number(form.monthly_fee) : 0,
      user_id: form.user_id.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("students").update(payload).eq("id", editing.id)
      : await supabase.from("students").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Added");
    setForm(empty);
    setEditing(null);
    load();
  };

  const startEdit = (s: Student) => {
    setEditing(s);
    setForm({
      name: s.name,
      age: s.age?.toString() ?? "",
      parent_name: s.parent_name ?? "",
      phone: s.phone ?? "",
      email: s.email ?? "",
      batch_id: s.batch_id ?? "",
      monthly_fee: s.monthly_fee?.toString() ?? "",
      user_id: s.user_id ?? "",
    });
  };

  const toggleActive = async (s: Student) => {
    const { error } = await supabase.from("students").update({ active: !s.active }).eq("id", s.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this student?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <PageHeader eyebrow="[ Students ]" title="Students" />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="space-y-3 border border-border p-6">
          <h2 className="font-display text-2xl">{editing ? "Edit Student" : "Add Student"}</h2>
          <Field label="Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age" type="number" value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
            <Field label="Monthly Fee (₹)" type="number" value={form.monthly_fee} onChange={(v) => setForm({ ...form, monthly_fee: v })} />
          </div>
          <Field label="Parent / Guardian" value={form.parent_name} onChange={(v) => setForm({ ...form, parent_name: v })} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <div className="space-y-2">
            <Label>Batch</Label>
            <select
              value={form.batch_id}
              onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
              className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm"
            >
              <option value="">— Unassigned —</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_name} ({b.age_group})
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Linked user ID (optional)"
            value={form.user_id}
            onChange={(v) => setForm({ ...form, user_id: v })}
            placeholder="auth user UUID — enables student portal"
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">{editing ? "Save" : "Add Student"}</Button>
            {editing && (
              <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm(empty); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="space-y-3">
          <h2 className="font-display text-2xl">All Students ({list.length})</h2>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && list.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}
          {list.map((s) => {
            const batch = batches.find((b) => b.id === s.batch_id);
            return (
              <div key={s.id} className="border border-border p-4 flex justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-lg">{s.name}{!s.active && " · HIDDEN"}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.age ? `${s.age}y · ` : ""}{batch?.batch_name ?? "No batch"}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.phone}{s.email ? ` · ${s.email}` : ""}</div>
                  {s.monthly_fee ? <div className="text-xs">₹{s.monthly_fee}/mo</div> : null}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => startEdit(s)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(s)}>{s.active ? "Hide" : "Show"}</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>Delete</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
