import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/DashboardShell";
import { useDummyAuth } from "@/hooks/useDummyAuth";
import {
  fetchCoachByUser,
  fetchCoachBatches,
  fetchPaidStudentsForBatches,
  fmtTime,
  type BatchFull,
} from "@/lib/enrollments";

export const Route = createFileRoute("/_authenticated/coach/batches")({
  component: CoachBatches,
});

type Roster = Awaited<ReturnType<typeof fetchPaidStudentsForBatches>>;

function CoachBatches() {
  const { user } = useDummyAuth();
  const [batches, setBatches] = useState<BatchFull[]>([]);
  const [roster, setRoster] = useState<Roster>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const coach = await fetchCoachByUser(user?.id, user?.full_name);
      const mine = coach ? await fetchCoachBatches(coach.id) : [];
      const rows = await fetchPaidStudentsForBatches(mine.map((b) => b.id));
      if (cancelled) return;
      setBatches(mine);
      setRoster(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.full_name]);

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
        {batches.map((b) => {
          const students = roster.filter((r) => r.batch_id === b.id);
          return (
            <div key={b.id} className="border border-border p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                {b.age_group}
                {b.active ? "" : " · Hidden"}
              </div>
              <div className="font-display text-2xl mb-2">{b.batch_name}</div>
              <div className="text-sm">{b.days}</div>
              <div className="text-sm">
                {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
              </div>
              {b.location && (
                <div className="text-xs text-muted-foreground mb-2">{b.location}</div>
              )}

              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-4 mb-1">
                Enrolled · {students.length}
                {b.max_students ? ` / ${b.max_students}` : ""}
              </div>
              {students.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No students have joined this batch yet.
                </p>
              ) : (
                <ul className="text-sm divide-y divide-border">
                  {students.map((s) => (
                    <li key={s.id} className="py-1.5">
                      {s.students?.name ?? "—"}
                      {s.students?.age ? (
                        <span className="text-xs text-muted-foreground"> · {s.students.age}y</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}

              <Link
                to="/coach/students"
                search={{ batch_id: b.id }}
                className="text-primary text-xs hover:underline inline-block mt-3"
              >
                View full roster →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
