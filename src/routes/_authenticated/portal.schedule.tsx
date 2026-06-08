import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/DashboardShell";
import { fetchActiveBatches, fmtTime, type BatchRow } from "@/lib/batches";

export const Route = createFileRoute("/_authenticated/portal/schedule")({
  component: MySchedule,
});

function MySchedule() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveBatches().then((b) => {
      setBatches(b);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader eyebrow="[ Schedule ]" title="Training Batches" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && batches.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No batches published yet. Check back soon.
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {batches.map((b) => (
          <div key={b.id} className="border border-border p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              {b.age_group}
            </div>
            <div className="font-display text-2xl mt-1">{b.batch_name}</div>
            <div className="text-sm mt-2">{b.days}</div>
            <div className="text-sm">
              {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
            </div>
            {b.location && (
              <div className="text-xs text-muted-foreground mt-1">{b.location}</div>
            )}
            <div className="text-xs mt-2">
              Coach:{" "}
              <span className="font-semibold">
                {b.coaches?.name ?? "Unassigned"}
              </span>
            </div>
            {b.notes && <div className="text-xs mt-2">{b.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
