import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/DashboardShell";
import { fetchActiveBatches, fmtTime, type BatchRow } from "@/lib/batches";
import { findMyStudent } from "@/lib/me";
import { useDummyAuth } from "@/hooks/useDummyAuth";

export const Route = createFileRoute("/_authenticated/portal/schedule")({
  component: MySchedule,
});

function MySchedule() {
  const { user } = useDummyAuth();
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [myBatchId, setMyBatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [all, me] = await Promise.all([
        fetchActiveBatches(),
        findMyStudent(user?.email),
      ]);
      setBatches(all);
      setMyBatchId(me?.batch_id ?? null);
      setLoading(false);
    })();
  }, [user?.email]);

  const mine = myBatchId ? batches.filter((b) => b.id === myBatchId) : [];
  const others = myBatchId ? batches.filter((b) => b.id !== myBatchId) : batches;

  return (
    <div>
      <PageHeader eyebrow="[ Schedule ]" title="My Training Schedule" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && !myBatchId && (
        <div className="border border-border p-4 mb-6 text-sm">
          You aren't assigned to a batch yet. Ask the admin to add you to one.
        </div>
      )}
      {mine.length > 0 && (
        <>
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-3">
            My Batch
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {mine.map((b) => (
              <BatchCard key={b.id} b={b} highlight />
            ))}
          </div>
        </>
      )}
      {others.length > 0 && (
        <>
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Other Batches
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {others.map((b) => (
              <BatchCard key={b.id} b={b} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BatchCard({ b, highlight }: { b: BatchRow; highlight?: boolean }) {
  return (
    <div
      className={`border p-6 ${highlight ? "border-primary" : "border-border"}`}
    >
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
        <span className="font-semibold">{b.coaches?.name ?? "Unassigned"}</span>
      </div>
      {b.notes && <div className="text-xs mt-2">{b.notes}</div>}
    </div>
  );
}