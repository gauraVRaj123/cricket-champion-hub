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

export const Route = createFileRoute("/_authenticated/coach/batches")({
  component: CoachBatches,
});

function CoachBatches() {
  const { user } = useDummyAuth();
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveBatches().then((b) => {
      setBatches(filterBatchesForCoach(b, user?.full_name));
      setLoading(false);
    });
  }, [user?.full_name]);

  return (
    <div>
      <PageHeader eyebrow="[ Batches ]" title="Assigned Batches" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && batches.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No batches assigned yet. Ask an admin to assign you to a batch.
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {batches.map((b) => (
          <div key={b.id} className="border border-border p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              {b.age_group}
            </div>
            <div className="font-display text-2xl mb-2">{b.batch_name}</div>
            <div className="text-sm">{b.days}</div>
            <div className="text-sm">
              {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
            </div>
            {b.location && (
              <div className="text-xs text-muted-foreground mb-2">{b.location}</div>
            )}
            {b.coaches?.name && (
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Coach: {b.coaches.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}