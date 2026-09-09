import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/DashboardShell";
import { useDummyAuth } from "@/hooks/useDummyAuth";
import {
  fetchCoachByUser,
  fetchCoachBatches,
  fetchPaidStudentsForBatches,
  type BatchFull,
} from "@/lib/enrollments";

type Search = { batch_id?: string };

export const Route = createFileRoute("/_authenticated/coach/students")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    batch_id: typeof search.batch_id === "string" ? search.batch_id : undefined,
  }),
  component: CoachStudents,
});

type Roster = Awaited<ReturnType<typeof fetchPaidStudentsForBatches>>;

function CoachStudents() {
  const { user } = useDummyAuth();
  const navigate = useNavigate({ from: "/coach/students" });
  const { batch_id } = Route.useSearch();
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

  const visible = batch_id ? roster.filter((r) => r.batch_id === batch_id) : roster;
  const batchName = (id: string) =>
    batches.find((b) => b.id === id)?.batch_name ?? "—";

  return (
    <div>
      <PageHeader eyebrow="[ Students ]" title={`My Students (${visible.length})`} />

      <div className="mb-6">
        <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground block mb-1">
          Filter by batch
        </label>
        <select
          value={batch_id ?? ""}
          onChange={(e) =>
            navigate({
              search: { batch_id: e.target.value || undefined },
            })
          }
          className="border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All my batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.batch_name} · {b.age_group}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && batches.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No batches assigned to you yet.
        </p>
      )}
      {!loading && batches.length > 0 && visible.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No enrolled students yet for this selection.
        </p>
      )}

      {visible.length > 0 && (
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-border">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Age</th>
                <th className="text-left p-3">Parent</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Batch</th>
                <th className="text-left p-3">Joined</th>
                <th className="text-left p-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-display">{r.students?.name ?? "—"}</td>
                  <td className="p-3">{r.students?.age ?? "—"}</td>
                  <td className="p-3">{r.students?.parent_name ?? "—"}</td>
                  <td className="p-3">{r.students?.phone ?? "—"}</td>
                  <td className="p-3">{batchName(r.batch_id)}</td>
                  <td className="p-3">
                    {new Date(r.enrolled_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] border border-primary text-primary px-2 py-1">
                      {r.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
