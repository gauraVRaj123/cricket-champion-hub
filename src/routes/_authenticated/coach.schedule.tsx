import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/coach/schedule")({
  component: CoachSchedule,
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
  active: boolean;
};

function CoachSchedule() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: c } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();
      if (!c) {
        setLoading(false);
        return;
      }
      const { data: b } = await supabase
        .from("batch_schedules")
        .select("*")
        .eq("coach_id", (c as { id: string }).id)
        .order("start_time");
      setBatches((b ?? []) as Batch[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader eyebrow="[ Schedule ]" title="My Schedule" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="space-y-3">
        {batches.map((s) => (
          <div key={s.id} className="border border-border p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              {s.age_group}
              {!s.active && " · HIDDEN"}
            </div>
            <div className="font-display text-xl">{s.batch_name}</div>
            <div className="text-sm">{s.days}</div>
            <div className="text-sm">
              {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
            </div>
            {s.location && (
              <div className="text-xs text-muted-foreground">{s.location}</div>
            )}
            {s.notes && <div className="text-xs mt-1">{s.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
