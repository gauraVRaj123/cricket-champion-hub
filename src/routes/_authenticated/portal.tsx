import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useIsAdmin";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Student Portal · Stump & Stride" },
      { name: "description", content: "Manage your profile, documents and trial bookings." },
    ],
  }),
  component: PortalPage,
});

const BATCHES = [
  "Morning Elite (06:00 – 09:00)",
  "Evening Grind (16:00 – 19:00)",
  "Weekend Warrior (Sat & Sun)",
  "Foundation (U-12)",
];

const AGE_GROUPS = ["U-12", "U-14", "U-16", "U-19", "Senior"];

const DOC_TYPES = [
  { value: "id_proof", label: "ID Proof (Aadhaar/School ID)" },
  { value: "age_proof", label: "Age Proof (Birth Cert.)" },
  { value: "medical", label: "Medical Certificate" },
  { value: "photo", label: "Passport Photo" },
  { value: "other", label: "Other" },
];

type Profile = {
  full_name: string;
  age: number | null;
  phone: string | null;
  parent_name: string | null;
  address: string | null;
  preferred_batch: string | null;
  age_group: string | null;
};

type DocRow = {
  id: string;
  doc_type: string;
  file_path: string;
  file_name: string;
  uploaded_at: string;
};

type Booking = {
  id: string;
  preferred_batch: string;
  trial_date: string;
  status: string;
  created_at: string;
};

const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  age: z.number().int().min(5).max(80),
  phone: z.string().trim().min(7).max(20),
  parent_name: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(500),
  preferred_batch: z.string().min(1),
  age_group: z.string().min(1),
});

function PortalPage() {
  const { user, signOut } = useAuth();
  const { isAdmin, isCoach, isStudent, checking } = useUserRoles();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const [{ data: p }, { data: d }, { data: b }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("student_documents").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false }),
      supabase.from("trial_bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setProfile(p as Profile | null);
    setDocs((d ?? []) as DocRow[]);
    setBookings((b ?? []) as Booking[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (checking) {
    return (
      <div className="py-32 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!isStudent && (isAdmin || isCoach)) {
    return (
      <div className="max-w-2xl mx-auto py-32 px-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
          [ 403 ]
        </div>
        <h1 className="font-display text-5xl mb-4">Wrong dashboard</h1>
        <p className="text-muted-foreground">
          The student portal is for student accounts. Head to your dashboard instead.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 font-mono text-xs">
          {isAdmin && (
            <Link to="/admin" className="underline underline-offset-4">
              → Admin dashboard
            </Link>
          )}
          {isCoach && (
            <Link to="/coach" className="underline underline-offset-4">
              → Coach dashboard
            </Link>
          )}
          <Link to="/" className="underline underline-offset-4 text-muted-foreground">
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const parsed = profileSchema.parse({
        full_name: fd.get("full_name"),
        age: Number(fd.get("age")),
        phone: fd.get("phone"),
        parent_name: fd.get("parent_name"),
        address: fd.get("address"),
        preferred_batch: fd.get("preferred_batch"),
        age_group: fd.get("age_group"),
      });
      const { error } = await supabase.from("profiles").update(parsed).eq("id", user.id);
      if (error) throw error;
      toast.success("Profile saved");
      load();
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function uploadDoc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File;
    const doc_type = String(fd.get("doc_type") ?? "");
    if (!file || file.size === 0) return toast.error("Select a file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("student-docs").upload(path, file);
    if (upErr) return toast.error(upErr.message);
    const { error: dbErr } = await supabase.from("student_documents").insert({
      user_id: user.id,
      doc_type,
      file_path: path,
      file_name: file.name,
    });
    if (dbErr) return toast.error(dbErr.message);
    toast.success("Uploaded");
    form.reset();
    load();
  }

  async function viewDoc(path: string) {
    const { data, error } = await supabase.storage.from("student-docs").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  }

  async function deleteDoc(id: string, path: string) {
    await supabase.storage.from("student-docs").remove([path]);
    await supabase.from("student_documents").delete().eq("id", id);
    toast.success("Deleted");
    load();
  }

  async function bookTrial(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const { error } = await supabase.from("trial_bookings").insert({
      user_id: user.id,
      student_name: profile?.full_name ?? "",
      age: profile?.age ?? 0,
      parent_name: profile?.parent_name ?? "",
      phone: profile?.phone ?? "",
      email: user.email ?? "",
      preferred_batch: String(fd.get("preferred_batch")),
      trial_date: String(fd.get("trial_date")),
    });
    if (error) return toast.error(error.message);
    toast.success("Trial booked");
    form.reset();
    load();
  }

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <header className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="font-mono text-xs text-primary uppercase tracking-widest mb-2">
              [ Student Portal ]
            </div>
            <h1 className="font-display text-5xl tracking-tighter">
              Hi, <span className="text-primary">{profile?.full_name || user?.email}</span>
            </h1>
          </div>
          <button
            onClick={() => signOut()}
            className="font-mono text-[11px] border border-border px-3 py-1.5 rounded hover:bg-foreground hover:text-background transition-all"
          >
            SIGN_OUT
          </button>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile */}
          <form onSubmit={saveProfile} className="bg-card border border-border p-8 space-y-4">
            <div className="font-mono text-xs text-primary uppercase tracking-widest">
              Profile
            </div>
            <Field label="Full name" name="full_name" defaultValue={profile?.full_name ?? ""} required />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age" name="age" type="number" defaultValue={profile?.age ?? ""} required />
              <SelectField label="Age group" name="age_group" defaultValue={profile?.age_group ?? ""} options={AGE_GROUPS} />
            </div>
            <Field label="Phone (WhatsApp)" name="phone" defaultValue={profile?.phone ?? ""} required />
            <Field label="Parent / Guardian" name="parent_name" defaultValue={profile?.parent_name ?? ""} required />
            <TextArea label="Address" name="address" defaultValue={profile?.address ?? ""} required />
            <SelectField label="Preferred batch" name="preferred_batch" defaultValue={profile?.preferred_batch ?? ""} options={BATCHES} />
            <button
              disabled={saving}
              className="bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-foreground transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </form>

          <div className="space-y-8">
            {/* Documents */}
            <div className="bg-card border border-border p-8 space-y-4">
              <div className="font-mono text-xs text-primary uppercase tracking-widest">
                Documents
              </div>
              <form onSubmit={uploadDoc} className="space-y-3">
                <SelectField label="Document type" name="doc_type" defaultValue="id_proof" options={DOC_TYPES.map((d) => ({ value: d.value, label: d.label }))} />
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    File (max 5 MB)
                  </label>
                  <input
                    type="file"
                    name="file"
                    required
                    accept="image/*,application/pdf"
                    className="w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:border-0 file:bg-foreground file:text-background"
                  />
                </div>
                <button className="bg-foreground text-background px-4 py-2 text-xs font-bold uppercase tracking-widest">
                  Upload
                </button>
              </form>
              <ul className="divide-y divide-border text-sm">
                {docs.length === 0 && <li className="py-3 text-muted-foreground">No documents yet.</li>}
                {docs.map((d) => (
                  <li key={d.id} className="flex justify-between items-center py-2 gap-3">
                    <div className="min-w-0">
                      <div className="truncate">{d.file_name}</div>
                      <div className="text-[10px] font-mono uppercase text-muted-foreground">
                        {d.doc_type}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => viewDoc(d.file_path)} className="text-xs underline text-primary">View</button>
                      <button onClick={() => deleteDoc(d.id, d.file_path)} className="text-xs underline text-muted-foreground">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trial Bookings */}
            <div className="bg-foreground text-background p-8 space-y-4">
              <div className="font-mono text-xs text-primary uppercase tracking-widest">
                Trial Bookings
              </div>
              <form onSubmit={bookTrial} className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-background/60 mb-2">
                    Batch
                  </label>
                  <select
                    name="preferred_batch"
                    required
                    defaultValue={profile?.preferred_batch ?? BATCHES[0]}
                    className="w-full bg-background text-foreground border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  >
                    {BATCHES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-background/60 mb-2">
                    Trial date
                  </label>
                  <input
                    type="date"
                    name="trial_date"
                    required
                    className="w-full bg-background text-foreground border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-end">
                  <button className="bg-primary text-primary-foreground px-4 py-3 text-xs font-bold uppercase tracking-widest w-full">
                    Book Trial
                  </button>
                </div>
              </form>
              <ul className="divide-y divide-background/10 text-sm">
                {bookings.length === 0 && <li className="py-3 text-background/60">No trial bookings yet.</li>}
                {bookings.map((b) => (
                  <li key={b.id} className="py-2 flex justify-between gap-3">
                    <div>
                      <div>{b.preferred_batch}</div>
                      <div className="text-[10px] font-mono uppercase text-background/60">
                        {b.trial_date} · {b.status}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        maxLength={255}
        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
        {label}
      </label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        maxLength={500}
        rows={3}
        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: (string | { value: string; label: string })[];
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary"
      >
        <option value="" disabled>Select…</option>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </div>
  );
}