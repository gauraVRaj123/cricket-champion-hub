import { supabase } from "@/integrations/supabase/client";

export type BatchRow = {
  id: string;
  batch_name: string;
  age_group: string;
  days: string;
  start_time: string;
  end_time: string;
  location: string | null;
  notes: string | null;
  monthly_fee: number | null;
  coach_id: string | null;
  active: boolean;
  coaches?: { id: string; name: string } | null;
};

export async function fetchActiveBatches(): Promise<BatchRow[]> {
  const { data, error } = await supabase
    .from("batch_schedules")
    .select("*, coaches(id,name)")
    .eq("active", true)
    .order("display_order");
  if (error) {
    console.error("fetchActiveBatches", error);
    return [];
  }
  return (data ?? []) as unknown as BatchRow[];
}

export function filterBatchesForCoach(batches: BatchRow[], coachName?: string) {
  if (!coachName) return batches.filter((b) => b.coach_id);
  const n = coachName.trim().toLowerCase();
  const mine = batches.filter(
    (b) => b.coaches?.name?.trim().toLowerCase() === n,
  );
  return mine.length ? mine : batches.filter((b) => b.coach_id);
}

export function fmtTime(t: string) {
  return t ? t.slice(0, 5) : "";
}