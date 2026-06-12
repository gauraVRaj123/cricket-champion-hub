import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/DashboardShell";
import { useDummyAuth } from "@/hooks/useDummyAuth";
import {
  fetchActiveBatches,
  filterBatchesForCoach,
  fmtTime,
  type BatchRow,
} from "@/lib/batches";

export const Route = createFileRoute("/_authenticated/coach/today")({
  component: CoachToday,
});

function CoachToday() {
  const { user } = useDummyAuth();
  const [batches, setBatches] = useState<BatchRow[]>([]);

  useEffect(() => {
    fetchActiveBatches().then((b) =>
      setBatches(filterBatchesForCoach(b, user?.full_name)),
    );
  }, [user?.full_name]);

  const today = new Date();
  const day = today.toLocaleDateString("en-US", { weekday: "short" });
  const sessions = batches.filter((b) => b.days.includes(day));

  return (
    <div>
      <PageHeader
        eyebrow={`[ ${today.toLocaleDateString()} ]`}
        title="Today's Sessions"
      />
      {sessions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No sessions scheduled today. Enjoy the rest day!
        </p>
      )}
      <div className="space-y-3">
        {sessions.map((b) => (
          <div
            key={b.id}
            className="border border-border p-4 flex flex-wrap justify-between gap-3 items-center"
          >
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                {b.location ? ` · ${b.location}` : ""}
              </div>
              <div className="font-display text-xl">{b.batch_name}</div>
              <div className="text-xs text-muted-foreground">
                {b.age_group}
                {b.coaches?.name ? ` · Coach ${b.coaches.name}` : ""}
              </div>
            </div>
            <Link
              to="/coach/attendance"
              className="font-mono text-[11px] border border-primary text-primary px-3 py-1.5 rounded hover:bg-primary hover:text-primary-foreground transition-all"
            >
              MARK ATTENDANCE →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}