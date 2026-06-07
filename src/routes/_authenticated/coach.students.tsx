import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/DashboardShell";
import { BATCHES, STUDENTS } from "@/lib/coachDummy";

export const Route = createFileRoute("/_authenticated/coach/students")({
  component: CoachStudents,
});

function CoachStudents() {
  return (
    <div>
      <PageHeader eyebrow="[ Students ]" title={`My Students (${STUDENTS.length})`} />
      <div className="space-y-3">
        {BATCHES.map((b) => {
          const list = STUDENTS.filter((s) => s.batch_id === b.id);
          return (
            <div key={b.id} className="border border-border p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
                {b.batch_name} · {b.age_group}
              </div>
              <ul className="text-sm divide-y divide-border">
                {list.map((s) => (
                  <li key={s.id} className="py-2 flex justify-between gap-3">
                    <div>
                      <div className="font-display">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.age}y · {s.playing_role} · Parent: {s.parent_name}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground self-center">{s.phone}</div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}