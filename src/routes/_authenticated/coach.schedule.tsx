import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/DashboardShell";
import { useDummyAuth } from "@/hooks/useDummyAuth";
import {
  fetchActiveBatches,
  filterBatchesForCoach,
  fmtTime,
  type BatchRow,
} from "@/lib/batches";

export const Route = createFileRoute("/_authenticated/coach/schedule")({
  component: CoachSchedule,
});

function CoachSchedule() {
  const { user } = useDummyAuth();
  const [batches, setBatches] = useState<BatchRow[]>([]);

  useEffect(() => {
    fetchActiveBatches().then((b) =>
      setBatches(filterBatchesForCoach(b, user?.full_name)),
    );
  }, [user?.full_name]);

  return (
    <div>
      <PageHeader eyebrow="[ Schedule ]" title="My Weekly Schedule" />
      {batches.length === 0 && (
        <p className="text-sm text-muted-foreground">No batches yet.</p>
      )}
      <div className="space-y-3">
        {batches.map((s) => (
          <div key={s.id} className="border border-border p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              {s.age_group}
            </div>
            <div className="font-display text-xl">{s.batch_name}</div>
            <div className="text-sm">{s.days}</div>
            <div className="text-sm">
              {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
            </div>
            {s.location && (
              <div className="text-xs text-muted-foreground">{s.location}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}