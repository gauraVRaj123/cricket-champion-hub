import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { BATCHES, STUDENTS } from "@/lib/coachDummy";

export const Route = createFileRoute("/_authenticated/coach/batches")({
  component: CoachBatches,
});

function CoachBatches() {
  return (
    <div>
      <PageHeader eyebrow="[ Batches ]" title="Assigned Batches" />
      <div className="grid md:grid-cols-2 gap-4">
        {BATCHES.map((b) => {
          const count = STUDENTS.filter((s) => s.batch_id === b.id).length;
          return (
            <div key={b.id} className="border border-border p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                {b.age_group}
              </div>
              <div className="font-display text-2xl mb-2">{b.batch_name}</div>
              <div className="text-sm">{b.days}</div>
              <div className="text-sm">{b.start_time} – {b.end_time}</div>
              <div className="text-xs text-muted-foreground mb-3">{b.location}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {count} students enrolled
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}