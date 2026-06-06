import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal/profile")({
  component: PortalProfile,
});

const AGE_GROUPS = ["U-12", "U-14", "U-16", "U-19", "Senior"];
const PLAYING_ROLES = ["Batsman", "Bowler", "All-rounder", "Wicket Keeper"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const DOC_TYPES = [
  { value: "id_proof", label: "ID Proof" },
  { value: "age_proof", label: "Age Proof" },
  { value: "medical", label: "Medical" },
  { value: "photo", label: "Photo" },
  { value: "other", label: "Other" },
];

type Profile = {
  full_name: string; age: number | null; phone: string | null; parent_name: string | null;
  address: string | null; preferred_batch: string | null; age_group: string | null;
  playing_role: string | null; blood_group: string | null; medical_info: string | null;
  emergency_contact: string | null; dob: string | null;
};
type DocRow = { id: string; doc_type: string; file_path: string; file_name: string; uploaded_at: string };
type Batch = { id: string; batch_name: string; age_group: string };

const schema = z.object({
  full_name: z.string().trim().min(2).max(80),
  age: z.number().int().min(5).max(80),
  phone: z.string().trim().min(7).max(20),
  parent_name: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(500),
  preferred_batch: z.string().min(1),
  age_group: z.string().min(1),
  playing_role: z.string().min(1),
  blood_group: z.string().optional().or(z.literal("")),
  medical_info: z.string().max(500).optional().or(z.literal("")),
  emergency_contact: z.string().max(20).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
});

function PortalProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const [{ data: p }, { data: d }, { data: b }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("student_documents").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false }),
      supabase.from("batch_schedules").select("id,batch_name,age_group").eq("active", true).order("batch_name"),
    ]);
    setProfile(p as Profile | null);
    setDocs((d ?? []) as DocRow[]);
    setBatches((b ?? []) as Batch[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const parsed = schema.parse({
        full_name: fd.get("full_name"),
        age: Number(fd.get("age")),
        phone: fd.get("phone"),
        parent_name: fd.get("parent_name"),
        address: fd.get("address"),
        preferred_batch: fd.get("preferred_batch"),
        age_group: fd.get("age_group"),
        playing_role: fd.get("playing_role"),
        blood_group: fd.get("blood_group") ?? "",
        medical_info: fd.get("medical_info") ?? "",
        emergency_contact: fd.get("emergency_contact") ?? "",
        dob: fd.get("dob") ?? "",
      });
      const payload = {
        ...parsed,
        blood_group: parsed.blood_group || null,
        medical_info: parsed.medical_info || null,
        emergency_contact: parsed.emergency_contact || null,
        dob: parsed.dob || null,
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
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
    const { error: dbErr } = await supabase.from("student_documents").insert({ user_id: user.id, doc_type, file_path: path, file_name: file.name });
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

  return (
    <div>
      <PageHeader eyebrow="[ Profile ]" title="My Profile" />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={saveProfile} className="border border-border p-6 space-y-3">
          <h2 className="font-display text-2xl mb-2">Personal Details</h2>
          <PField label="Full name" name="full_name" defaultValue={profile?.full_name ?? ""} required />
          <div className="grid grid-cols-2 gap-3">
            <PField label="Age" name="age" type="number" defaultValue={profile?.age ?? ""} required />
            <PField label="Date of birth" name="dob" type="date" defaultValue={profile?.dob ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PSelect label="Age group" name="age_group" defaultValue={profile?.age_group ?? ""} options={AGE_GROUPS} />
            <PSelect label="Playing role" name="playing_role" defaultValue={profile?.playing_role ?? ""} options={PLAYING_ROLES} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PField label="Phone" name="phone" defaultValue={profile?.phone ?? ""} required />
            <PField label="Emergency contact" name="emergency_contact" defaultValue={profile?.emergency_contact ?? ""} />
          </div>
          <PField label="Parent / Guardian" name="parent_name" defaultValue={profile?.parent_name ?? ""} required />
          <PTextArea label="Address" name="address" defaultValue={profile?.address ?? ""} required />
          <PSelect label="Preferred batch" name="preferred_batch" defaultValue={profile?.preferred_batch ?? ""} options={batches.map((b) => ({ value: b.batch_name, label: `${b.batch_name} (${b.age_group})` }))} />
          <h3 className="font-display text-lg pt-2">Medical</h3>
          <PSelect label="Blood group" name="blood_group" defaultValue={profile?.blood_group ?? ""} options={BLOOD_GROUPS} optional />
          <PTextArea label="Medical info / allergies" name="medical_info" defaultValue={profile?.medical_info ?? ""} />
          <button disabled={saving} className="bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-foreground transition-colors disabled:opacity-50 w-full">
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </form>

        <div className="border border-border p-6 space-y-3">
          <h2 className="font-display text-2xl">Documents</h2>
          <form onSubmit={uploadDoc} className="space-y-2">
            <PSelect label="Type" name="doc_type" defaultValue="id_proof" options={DOC_TYPES} />
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">File (max 5 MB)</label>
              <input type="file" name="file" required accept="image/*,application/pdf" className="w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:border-0 file:bg-foreground file:text-background" />
            </div>
            <button className="bg-foreground text-background px-4 py-2 text-xs font-bold uppercase tracking-widest">Upload</button>
          </form>
          <ul className="divide-y divide-border text-sm">
            {docs.length === 0 && <li className="py-3 text-muted-foreground">No documents yet.</li>}
            {docs.map((d) => (
              <li key={d.id} className="flex justify-between items-center py-2 gap-3">
                <div className="min-w-0">
                  <div className="truncate">{d.file_name}</div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">{d.doc_type}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => viewDoc(d.file_path)} className="text-xs underline text-primary">View</button>
                  <button onClick={() => deleteDoc(d.id, d.file_path)} className="text-xs underline text-muted-foreground">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PField({ label, name, type = "text", defaultValue, required }: { label: string; name: string; type?: string; defaultValue?: string | number | null; required?: boolean }) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{label}</label>
      <input type={type} name={name} defaultValue={defaultValue ?? ""} required={required} maxLength={255} className="w-full bg-background border border-border px-4 py-2 text-sm focus:outline-none focus:border-primary" />
    </div>
  );
}
function PTextArea({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string | null; required?: boolean }) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{label}</label>
      <textarea name={name} defaultValue={defaultValue ?? ""} required={required} maxLength={500} rows={3} className="w-full bg-background border border-border px-4 py-2 text-sm focus:outline-none focus:border-primary" />
    </div>
  );
}
function PSelect({ label, name, defaultValue, options, optional }: { label: string; name: string; defaultValue?: string | null; options: (string | { value: string; label: string })[]; optional?: boolean }) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{label}</label>
      <select name={name} defaultValue={defaultValue ?? ""} className="w-full bg-background border border-border px-4 py-2 text-sm focus:outline-none focus:border-primary">
        <option value="" disabled={!optional}>{optional ? "—" : "Select…"}</option>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </div>
  );
}