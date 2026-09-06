import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useDummyAuth } from "@/hooks/useDummyAuth";
import {
  fetchBatches,
  findOrCreateStudent,
  fmtTime,
  type BatchFull,
} from "@/lib/enrollments";

export const Route = createFileRoute("/_authenticated/portal/batches")({
  head: () => ({
    meta: [
      { title: "Available Batches · Stump & Stride" },
      {
        name: "description",
        content: "Browse active academy batches and join the one that fits you.",
      },
    ],
  }),
  component: PortalBatches,
});

function PortalBatches() {
  const { user } = useDummyAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<BatchFull[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [mine, setMine] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await fetchBatches(true);
    setBatches(list);
    const student = await findOrCreateStudent(user?.email, user?.full_name);
    setStudentId(student?.id ?? null);
    if (student) {
      const { data } = await supabase
        .from("batch_enrollments")
        .select("batch_id,payment_status")
        .eq("student_id", student.id);
      const map: Record<string, string> = {};
      for (const e of data ?? []) map[e.batch_id] = e.payment_status;
      setMine(map);
    }
    setLoading(false);
  }, [user?.email, user?.full_name]);

  useEffect(() => {
    load();
  }, [load]);

  const join = async (b: BatchFull) => {
    if (!studentId) return toast.error("Could not find your student profile");
    setBusy(b.id);
    const { error } = await supabase.from("batch_enrollments").upsert(
      {
        batch_id: b.id,
        student_id: studentId,
        payment_status: "pending",
        amount_paid: b.monthly_fee ?? 0,
      },
      { onConflict: "batch_id,student_id" },
    );
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Taking you to payment…");
    navigate({ to: "/payment-success", search: { batch_id: b.id } });
  };

  return (
    <div>
      <PageHeader eyebrow="[ Batches ]" title="Available Batches" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && batches.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No batches are open right now. Please check back soon.
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {batches.map((b) => {
          const status = mine[b.id];
          return (
            <div key={b.id} className="border border-border p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                {b.age_group}
              </div>
              <div className="font-display text-2xl mb-1">{b.batch_name}</div>
              <div className="text-sm">
                {b.days} · {fmtTime(b.start_time)}–{fmtTime(b.end_time)}
              </div>
              {b.location && (
                <div className="text-xs text-muted-foreground">{b.location}</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Coaches:{" "}
                {b.coaches_list.length
                  ? b.coaches_list.map((c) => c.name).join(", ")
                  : "Unassigned"}
              </div>
              <div className="mt-4">
                {status === "paid" ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] border border-primary text-primary px-3 py-1">
                    ✓ Enrolled
                  </span>
                ) : (
                  <Button
                    disabled={busy === b.id}
                    onClick={() => join(b)}
                    className="w-full"
                  >
                    {busy === b.id
                      ? "Please wait…"
                      : `Join Batch — ₹${b.monthly_fee ?? 0}/mo`}
                  </Button>
                )}
                {status === "pending" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Payment pending — finish checkout to confirm your seat.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
