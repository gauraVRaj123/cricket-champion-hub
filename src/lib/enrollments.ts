import { supabase } from "@/integrations/supabase/client";

export type CoachLite = { id: string; name: string; role: string | null };

export type BatchFull = {
  id: string;
  batch_name: string;
  age_group: string;
  days: string;
  start_time: string;
  end_time: string;
  location: string | null;
  notes: string | null;
  monthly_fee: number | null;
  max_students: number | null;
  display_order: number;
  active: boolean;
  coach_id: string | null;
  coaches_list: CoachLite[];
};

export type EnrollmentRow = {
  id: string;
  batch_id: string;
  student_id: string;
  user_id: string | null;
  payment_status: string;
  amount_paid: number | null;
  enrolled_at: string;
};

export function fmtTime(t?: string | null) {
  return t ? t.slice(0, 5) : "";
}

type RawBatch = Omit<BatchFull, "coaches_list"> & {
  batch_coaches?: { coaches: CoachLite | null }[] | null;
};

const SELECT = "*, batch_coaches(coach_id, coaches(id,name,role))";

function shape(rows: RawBatch[]): BatchFull[] {
  return rows.map((b) => ({
    ...b,
    coaches_list: (b.batch_coaches ?? [])
      .map((x) => x.coaches)
      .filter(Boolean) as CoachLite[],
  }));
}

export async function fetchBatches(onlyActive = false): Promise<BatchFull[]> {
  let q = supabase.from("batch_schedules").select(SELECT).order("display_order");
  if (onlyActive) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) {
    console.error("fetchBatches", error);
    return [];
  }
  return shape((data ?? []) as unknown as RawBatch[]);
}

export async function fetchEnrollments(): Promise<EnrollmentRow[]> {
  const { data } = await supabase
    .from("batch_enrollments")
    .select("*")
    .order("enrolled_at", { ascending: false });
  return (data ?? []) as EnrollmentRow[];
}

export async function setBatchCoaches(batchId: string, coachIds: string[]) {
  const del = await supabase
    .from("batch_coaches")
    .delete()
    .eq("batch_id", batchId);
  if (del.error) return del.error;
  if (!coachIds.length) return null;
  const ins = await supabase
    .from("batch_coaches")
    .insert(coachIds.map((coach_id) => ({ batch_id: batchId, coach_id })));
  return ins.error;
}

/** Resolve (or create) the students row for the signed-in demo student. */
export async function findOrCreateStudent(
  email?: string,
  name?: string,
): Promise<{ id: string; name: string; email: string | null } | null> {
  if (!email) return null;
  const { data } = await supabase
    .from("students")
    .select("id,name,email")
    .ilike("email", email)
    .maybeSingle();
  if (data) return data as { id: string; name: string; email: string | null };
  const { data: created, error } = await supabase
    .from("students")
    .insert({ name: name || email, email })
    .select("id,name,email")
    .maybeSingle();
  if (error) {
    console.error("findOrCreateStudent", error);
    return null;
  }
  return created as { id: string; name: string; email: string | null };
}

export async function fetchCoachByUser(userId?: string, fullName?: string) {
  if (userId) {
    const { data } = await supabase
      .from("coaches")
      .select("id,name,role,certifications,experience_years,user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) return data;
  }
  if (fullName) {
    const { data } = await supabase
      .from("coaches")
      .select("id,name,role,certifications,experience_years,user_id")
      .ilike("name", fullName)
      .maybeSingle();
    if (data) return data;
  }
  return null;
}

/** Batches assigned to a coach via batch_coaches (falls back to legacy coach_id). */
export async function fetchCoachBatches(coachId?: string): Promise<BatchFull[]> {
  if (!coachId) return [];
  const all = await fetchBatches(false);
  return all.filter(
    (b) => b.coach_id === coachId || b.coaches_list.some((c) => c.id === coachId),
  );
}

export async function fetchPaidStudentsForBatches(batchIds: string[]) {
  if (!batchIds.length) return [];
  const { data, error } = await supabase
    .from("batch_enrollments")
    .select(
      "id,batch_id,payment_status,amount_paid,enrolled_at,students(id,name,age,parent_name,phone,email)",
    )
    .in("batch_id", batchIds)
    .eq("payment_status", "paid");
  if (error) {
    console.error("fetchPaidStudentsForBatches", error);
    return [];
  }
  return (data ?? []) as unknown as {
    id: string;
    batch_id: string;
    payment_status: string;
    amount_paid: number | null;
    enrolled_at: string;
    students: {
      id: string;
      name: string;
      age: number | null;
      parent_name: string | null;
      phone: string | null;
      email: string | null;
    } | null;
  }[];
}
