import { supabase } from "@/integrations/supabase/client";

export type MyStudent = {
  id: string;
  name: string;
  email: string | null;
  batch_id: string | null;
  monthly_fee: number | null;
};

export type MyCoach = {
  id: string;
  name: string;
};

export async function findMyStudent(email?: string): Promise<MyStudent | null> {
  if (!email) return null;
  const { data } = await supabase
    .from("students")
    .select("id,name,email,batch_id,monthly_fee")
    .ilike("email", email)
    .maybeSingle();
  return (data as MyStudent | null) ?? null;
}

export async function findMyCoach(fullName?: string): Promise<MyCoach | null> {
  if (!fullName) return null;
  const { data } = await supabase
    .from("coaches")
    .select("id,name")
    .ilike("name", fullName)
    .maybeSingle();
  return (data as MyCoach | null) ?? null;
}

export async function fetchStudentsForBatches(batchIds: string[]) {
  if (!batchIds.length) return [];
  const { data } = await supabase
    .from("students")
    .select("id,name,age,phone,parent_name,batch_id,email")
    .in("batch_id", batchIds)
    .eq("active", true)
    .order("name");
  return data ?? [];
}