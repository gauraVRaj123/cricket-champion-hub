import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { BATCHES, STUDENTS } from "@/lib/coachDummy";

export const Route = createFileRoute("/_authenticated/coach/today")({
  component: CoachToday,
});

function CoachToday() {
  const today = new Date();
  const day = today.toLocaleDateString("en-US", { weekday: "short" });
  const sessions = BATCHES.filter((b) => b.days.includes(day));

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
        {sessions.map((b) => {
          const count = STUDENTS.filter((s) => s.batch_id === b.id).length;
          return (
            <div key={b.id} className="border border-border p-4 flex flex-wrap justify-between gap-3 items-center">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                  {b.start_time} – {b.end_time} · {b.location}
                </div>
                <div className="font-display text-xl">{b.batch_name}</div>
                <div className="text-xs text-muted-foreground">{count} students</div>
              </div>
              <Link
                to="/coach/attendance"
                className="font-mono text-[11px] border border-primary text-primary px-3 py-1.5 rounded hover:bg-primary hover:text-primary-foreground transition-all"
              >
                MARK ATTENDANCE →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}