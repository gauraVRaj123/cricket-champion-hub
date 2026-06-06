import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal/schedule")({
  component: MySchedule,
});

type Batch = {
  id: string;
  batch_name: string;
  age_group: string;
  days: string;
  start_time: string;
  end_time: string;
  location: string | null;
  notes: string | null;
};

function MySchedule() {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: s } = await supabase
        .from("students")
        .select("batch_id")
        .eq("user_id", uid)
        .maybeSingle();
      const batchId = (s as { batch_id: string | null } | null)?.batch_id;
      if (batchId) {
        const { data: b } = await supabase
          .from("batch_schedules")
          .select("*")
          .eq("id", batchId)
          .maybeSingle();
        setBatch(b as Batch | null);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader eyebrow="[ Schedule ]" title="My Batch Schedule" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && !batch && (
        <p className="text-sm text-muted-foreground">
          You're not assigned to a batch yet.
        </p>
      )}
      {batch && (
        <div className="border border-border p-6 max-w-lg">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
            {batch.age_group}
          </div>
          <div className="font-display text-3xl mt-1">{batch.batch_name}</div>
          <div className="text-sm mt-2">{batch.days}</div>
          <div className="text-sm">
            {batch.start_time.slice(0, 5)} – {batch.end_time.slice(0, 5)}
          </div>
          {batch.location && (
            <div className="text-xs text-muted-foreground mt-1">
              {batch.location}
            </div>
          )}
          {batch.notes && <div className="text-xs mt-2">{batch.notes}</div>}
        </div>
      )}
    </div>
  );
}
