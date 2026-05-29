import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin · Stump & Stride" }],
  }),
  component: AdminPage,
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
};

type Schedule = {
  id: string;
  batch_name: string;
  age_group: string;
  days: string;
  start_time: string;
  end_time: string;
  coach_id: string | null;
  location: string | null;
  notes: string | null;
  display_order: number;
  active: boolean;
};

function AdminPage() {
  const { isAdmin, checking } = useIsAdmin();
  const [tab, setTab] = useState<"coaches" | "schedules">("coaches");

  if (checking) {
    return (
      <div className="py-32 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-32 px-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
          [ 403 ]
        </div>
        <h1 className="font-display text-5xl mb-4">Admins only</h1>
        <p className="text-muted-foreground">
          You need an admin role to access this page. Ask the academy owner to promote your account.
        </p>
        <Link
          to="/portal"
          className="inline-block mt-8 font-mono text-xs underline underline-offset-4"
        >
          ← Back to portal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            [ ADMIN ]
          </div>
          <h1 className="font-display text-5xl mt-2">Academy Control</h1>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <button
            onClick={() => setTab("coaches")}
            className={`px-4 py-2 border ${tab === "coaches" ? "bg-foreground text-background border-foreground" : "border-border"}`}
          >
            COACHES
          </button>
          <button
            onClick={() => setTab("schedules")}
            className={`px-4 py-2 border ${tab === "schedules" ? "bg-foreground text-background border-foreground" : "border-border"}`}
          >
            SCHEDULES
          </button>
        </div>
      </div>

      {tab === "coaches" ? <CoachesAdmin /> : <SchedulesAdmin />}
    </div>
  );
}

function CoachesAdmin() {
  const [list, setList] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    role: "",
    certifications: "",
    experience_years: "",
    bio: "",
    photo_url: "",
    display_order: "0",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coaches")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    setList((data as Coach[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      toast.error("Name and role are required");
      return;
    }
    const { error } = await supabase.from("coaches").insert({
      name: form.name.trim(),
      role: form.role.trim(),
      certifications: form.certifications.trim() || null,
      experience_years: form.experience_years ? Number(form.experience_years) : 0,
      bio: form.bio.trim() || null,
      photo_url: form.photo_url.trim() || null,
      display_order: Number(form.display_order) || 0,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Coach added");
    setForm({ name: "", role: "", certifications: "", experience_years: "", bio: "", photo_url: "", display_order: "0" });
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
    <div className="grid lg:grid-cols-2 gap-10">
      <form onSubmit={submit} className="space-y-4 border border-border p-6">
        <h2 className="font-display text-2xl">Add Coach</h2>
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Role / Title" value={form.role} onChange={(v) => setForm({ ...form, role: v })} required />
        <Field label="Certifications" value={form.certifications} onChange={(v) => setForm({ ...form, certifications: v })} placeholder="BCCI Level 2" />
        <Field label="Experience (years)" type="number" value={form.experience_years} onChange={(v) => setForm({ ...form, experience_years: v })} />
        <Field label="Photo URL" value={form.photo_url} onChange={(v) => setForm({ ...form, photo_url: v })} placeholder="https://..." />
        <div className="space-y-2">
          <Label>Bio</Label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full border border-input bg-transparent rounded-md px-3 py-2 text-sm"
          />
        </div>
        <Field label="Display order" type="number" value={form.display_order} onChange={(v) => setForm({ ...form, display_order: v })} />
        <Button type="submit" className="w-full">Add Coach</Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-display text-2xl">All Coaches ({list.length})</h2>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && list.length === 0 && <p className="text-sm text-muted-foreground">No coaches yet.</p>}
        {list.map((c) => (
          <div key={c.id} className="border border-border p-4 flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                {c.certifications || "—"}
              </div>
              <div className="font-display text-xl mt-1">{c.name}</div>
              <div className="text-xs font-semibold">{c.role}</div>
              {c.bio && <p className="text-xs text-muted-foreground mt-2">{c.bio}</p>}
              <div className="text-[10px] font-mono mt-2 text-muted-foreground">
                #{c.display_order} · {c.active ? "ACTIVE" : "HIDDEN"}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => toggleActive(c)}>
                {c.active ? "Hide" : "Show"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(c.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchedulesAdmin() {
  const [list, setList] = useState<Schedule[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    batch_name: "",
    age_group: "",
    days: "",
    start_time: "06:00",
    end_time: "09:00",
    coach_id: "",
    location: "",
    notes: "",
    display_order: "0",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from("batch_schedules").select("*").order("display_order", { ascending: true }),
      supabase.from("coaches").select("*").order("name", { ascending: true }),
    ]);
    setList((s as Schedule[]) ?? []);
    setCoaches((c as Coach[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.batch_name.trim() || !form.age_group.trim() || !form.days.trim()) {
      toast.error("Batch name, age group, and days are required");
      return;
    }
    const { error } = await supabase.from("batch_schedules").insert({
      batch_name: form.batch_name.trim(),
      age_group: form.age_group.trim(),
      days: form.days.trim(),
      start_time: form.start_time,
      end_time: form.end_time,
      coach_id: form.coach_id || null,
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
      display_order: Number(form.display_order) || 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Batch published");
    setForm({ batch_name: "", age_group: "", days: "", start_time: "06:00", end_time: "09:00", coach_id: "", location: "", notes: "", display_order: "0" });
    load();
  };

  const toggleActive = async (s: Schedule) => {
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

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <form onSubmit={submit} className="space-y-4 border border-border p-6">
        <h2 className="font-display text-2xl">Publish Batch</h2>
        <Field label="Batch name" value={form.batch_name} onChange={(v) => setForm({ ...form, batch_name: v })} required placeholder="Morning Elite" />
        <Field label="Age group" value={form.age_group} onChange={(v) => setForm({ ...form, age_group: v })} required placeholder="U-14, U-16" />
        <Field label="Days" value={form.days} onChange={(v) => setForm({ ...form, days: v })} required placeholder="Mon · Wed · Fri" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start time" type="time" value={form.start_time} onChange={(v) => setForm({ ...form, start_time: v })} />
          <Field label="End time" type="time" value={form.end_time} onChange={(v) => setForm({ ...form, end_time: v })} />
        </div>
        <div className="space-y-2">
          <Label>Assigned coach</Label>
          <select
            value={form.coach_id}
            onChange={(e) => setForm({ ...form, coach_id: e.target.value })}
            className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm"
          >
            <option value="">— None —</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Net 1, Andheri Ground" />
        <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="₹ 3,500 / month" />
        <Field label="Display order" type="number" value={form.display_order} onChange={(v) => setForm({ ...form, display_order: v })} />
        <Button type="submit" className="w-full">Publish</Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-display text-2xl">All Batches ({list.length})</h2>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && list.length === 0 && <p className="text-sm text-muted-foreground">No batches yet.</p>}
        {list.map((s) => {
          const coach = coaches.find((c) => c.id === s.coach_id);
          return (
            <div key={s.id} className="border border-border p-4 flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                  {s.age_group}
                </div>
                <div className="font-display text-xl mt-1">{s.batch_name}</div>
                <div className="text-xs">{s.days} · {s.start_time.slice(0,5)} – {s.end_time.slice(0,5)}</div>
                {coach && <div className="text-xs text-muted-foreground">Coach: {coach.name}</div>}
                {s.location && <div className="text-xs text-muted-foreground">{s.location}</div>}
                {s.notes && <div className="text-xs mt-1">{s.notes}</div>}
                <div className="text-[10px] font-mono mt-2 text-muted-foreground">
                  #{s.display_order} · {s.active ? "ACTIVE" : "HIDDEN"}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => toggleActive(s)}>
                  {s.active ? "Hide" : "Show"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}{required && <span className="text-primary"> *</span>}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}