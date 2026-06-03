import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/admin/Field";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/admin/coaches")({
  component: CoachesAdmin,
});

type Coach = {
  id: string;
  name: string;
  role: string;
  certifications: string | null;
  experience_years: number | null;
  bio: string | null;
  photo_url: string | null;
  display_order: number;
  active: boolean;
  user_id: string | null;
};

function CoachesAdmin() {
  const [list, setList] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const empty = { name: "", role: "", certifications: "", experience_years: "", bio: "", photo_url: "", display_order: "0", user_id: "" };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("coaches").select("*").order("display_order");
    if (error) toast.error(error.message);
    setList((data ?? []) as Coach[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return toast.error("Name and role required");
    const { error } = await supabase.from("coaches").insert({
      name: form.name.trim(),
      role: form.role.trim(),
      certifications: form.certifications.trim() || null,
      experience_years: form.experience_years ? Number(form.experience_years) : 0,
      bio: form.bio.trim() || null,
      photo_url: form.photo_url.trim() || null,
      display_order: Number(form.display_order) || 0,
      user_id: form.user_id.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Coach added");
    setForm(empty);
    load();
  };

  const toggleActive = async (c: Coach) => {
    const { error } = await supabase.from("coaches").update({ active: !c.active }).eq("id", c.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coach?")) return;
    const { error } = await supabase.from("coaches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <PageHeader eyebrow="[ Coaches ]" title="Coaches" />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="space-y-3 border border-border p-6">
          <h2 className="font-display text-2xl">Add Coach</h2>
          <Field label="Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Role / Title" required value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
          <Field label="Certifications" value={form.certifications} onChange={(v) => setForm({ ...form, certifications: v })} />
          <Field label="Experience (years)" type="number" value={form.experience_years} onChange={(v) => setForm({ ...form, experience_years: v })} />
          <Field label="Photo URL" value={form.photo_url} onChange={(v) => setForm({ ...form, photo_url: v })} />
          <Field label="Linked user ID" value={form.user_id} onChange={(v) => setForm({ ...form, user_id: v })} placeholder="auth user UUID" />
          <div className="space-y-2">
            <Label>Bio</Label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full border border-input bg-transparent rounded-md px-3 py-2 text-sm" />
          </div>
          <Field label="Display order" type="number" value={form.display_order} onChange={(v) => setForm({ ...form, display_order: v })} />
          <Button type="submit" className="w-full">Add Coach</Button>
        </form>

        <div className="space-y-3">
          <h2 className="font-display text-2xl">All Coaches ({list.length})</h2>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && list.length === 0 && <p className="text-sm text-muted-foreground">No coaches yet.</p>}
          {list.map((c) => (
            <div key={c.id} className="border border-border p-4 flex justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">{c.certifications || "—"}</div>
                <div className="font-display text-lg">{c.name}</div>
                <div className="text-xs">{c.role}</div>
                {c.bio && <p className="text-xs text-muted-foreground mt-1">{c.bio}</p>}
                <div className="text-[10px] font-mono mt-1 text-muted-foreground">#{c.display_order} · {c.active ? "ACTIVE" : "HIDDEN"}</div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => toggleActive(c)}>{c.active ? "Hide" : "Show"}</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(c.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
