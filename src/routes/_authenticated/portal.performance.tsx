import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";
import { findMyStudent } from "@/lib/me";
import { useDummyAuth } from "@/hooks/useDummyAuth";

export const Route = createFileRoute("/_authenticated/portal/performance")({
  component: MyPerformance,
});

type Note = {
  id: string;
  rating: number | null;
  remarks: string | null;
  created_at: string;
};

function MyPerformance() {
  const { user } = useDummyAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await findMyStudent(user?.email);
      if (!s) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("performance_notes")
        .select("*")
        .eq("student_id", s.id)
        .order("created_at", { ascending: false });
      setNotes((data ?? []) as Note[]);
      setLoading(false);
    })();
  }, [user?.email]);

  const avg = notes.length
    ? (notes.reduce((s, n) => s + (n.rating ?? 0), 0) / notes.length).toFixed(1)
    : "—";

  return (
    <div>
      <PageHeader eyebrow="[ Performance ]" title="My Performance" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && notes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No performance notes yet.
        </p>
      )}
      {notes.length > 0 && (
        <>
          <div className="border border-border p-6 mb-6 max-w-xs">
            <div className="text-xs font-mono uppercase text-primary mb-2">
              Average Rating
            </div>
            <div className="font-display text-4xl">
              {avg} <span className="text-primary text-2xl">★</span>
            </div>
          </div>
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="border border-border p-4">
                <div className="flex justify-between">
                  <div className="font-mono text-xs text-primary">
                    {"★".repeat(n.rating ?? 0)}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
                {n.remarks && <p className="text-sm mt-2">{n.remarks}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
