import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/coach/students")({
  component: CoachStudents,
});

type Student = {
  id: string;
  name: string;
  age: number | null;
  parent_name: string | null;
  phone: string | null;
  batch_id: string | null;
};
type Batch = { id: string; batch_name: string };

function CoachStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: c } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();
      if (!c) {
        setLoading(false);
        return;
      }
      const { data: b } = await supabase
        .from("batch_schedules")
        .select("id,batch_name")
        .eq("coach_id", (c as { id: string }).id);
      const batchList = (b ?? []) as Batch[];
      setBatches(batchList);
      if (batchList.length) {
        const { data: s } = await supabase
          .from("students")
          .select("id,name,age,parent_name,phone,batch_id")
          .in(
            "batch_id",
            batchList.map((x) => x.id),
          )
          .order("name");
        setStudents((s ?? []) as Student[]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="[ Students ]"
        title={`My Students (${students.length})`}
      />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && students.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No students in your batches yet.
        </p>
      )}
      <div className="space-y-2">
        {batches.map((b) => {
          const list = students.filter((s) => s.batch_id === b.id);
          if (!list.length) return null;
          return (
            <div key={b.id} className="border border-border p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
                {b.batch_name}
              </div>
              <ul className="text-sm divide-y divide-border">
                {list.map((s) => (
                  <li key={s.id} className="py-2 flex justify-between">
                    <div>
                      <div className="font-display">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.age ? `${s.age}y · ` : ""}
                        {s.parent_name ?? ""}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground self-center">
                      {s.phone}
                    </div>
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
