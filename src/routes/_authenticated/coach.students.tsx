import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/DashboardShell";
import { useDummyAuth } from "@/hooks/useDummyAuth";
import {
  fetchActiveBatches,
  filterBatchesForCoach,
  type BatchRow,
} from "@/lib/batches";
import { fetchStudentsForBatches } from "@/lib/me";

type Student = {
  id: string;
  name: string;
  age: number | null;
  phone: string | null;
  parent_name: string | null;
  batch_id: string | null;
  email: string | null;
};

export const Route = createFileRoute("/_authenticated/coach/students")({
  component: CoachStudents,
});

function CoachStudents() {
  const { user } = useDummyAuth();
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await fetchActiveBatches();
      const mine = filterBatchesForCoach(all, user?.full_name);
      setBatches(mine);
      const rows = await fetchStudentsForBatches(mine.map((b) => b.id));
      setStudents(rows as Student[]);
      setLoading(false);
    })();
  }, [user?.full_name]);

  return (
    <div>
      <PageHeader
        eyebrow="[ Students ]"
        title={`My Students (${students.length})`}
      />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && batches.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No batches assigned to you yet.
        </p>
      )}
      <div className="space-y-3">
        {batches.map((b) => {
          const list = students.filter((s) => s.batch_id === b.id);
          return (
            <div key={b.id} className="border border-border p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
                {b.batch_name} · {b.age_group}
              </div>
              {list.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No students assigned to this batch yet.
                </p>
              ) : (
                <ul className="text-sm divide-y divide-border">
                  {list.map((s) => (
                    <li key={s.id} className="py-2 flex justify-between gap-3">
                      <div>
                        <div className="font-display">{s.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.age ? `${s.age}y` : ""}
                          {s.parent_name ? ` · Parent: ${s.parent_name}` : ""}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground self-center">
                        {s.phone}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}