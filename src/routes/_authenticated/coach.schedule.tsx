import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { BATCHES } from "@/lib/coachDummy";

export const Route = createFileRoute("/_authenticated/coach/schedule")({
  component: CoachSchedule,
});

function CoachSchedule() {
  return (
    <div>
      <PageHeader eyebrow="[ Schedule ]" title="My Weekly Schedule" />
      <div className="space-y-3">
        {BATCHES.map((s) => (
          <div key={s.id} className="border border-border p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              {s.age_group}
            </div>
            <div className="font-display text-xl">{s.batch_name}</div>
            <div className="text-sm">{s.days}</div>
            <div className="text-sm">{s.start_time} – {s.end_time}</div>
            <div className="text-xs text-muted-foreground">{s.location}</div>
          </div>
        ))}
      </div>
    </div>
  );
}