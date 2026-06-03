import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/admin/Field";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/admin/fees")({
  component: AdminFees,
});

type Payment = {
  id: string;
  student_id: string;
  amount: number;
  fee_month: string;
  paid_on: string;
  method: string | null;
  notes: string | null;
};

type Student = { id: string; name: string; monthly_fee: number | null };

function AdminFees() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
  const empty = { student_id: "", amount: "", fee_month: currentMonth, paid_on: new Date().toISOString().slice(0, 10), method: "cash", notes: "" };
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from("fee_payments").select("*").order("paid_on", { ascending: false }).limit(100),
      supabase.from("students").select("id,name,monthly_fee").eq("active", true).order("name"),
    ]);
    setPayments((p ?? []) as Payment[]);
    setStudents((s ?? []) as Student[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.amount) return toast.error("Student and amount required");
    const { error } = await supabase.from("fee_payments").insert({
      student_id: form.student_id,
      amount: Number(form.amount),
      fee_month: form.fee_month,
      paid_on: form.paid_on,
      method: form.method,
      notes: form.notes.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    setForm({ ...empty, fee_month: form.fee_month, paid_on: form.paid_on });
    load();
  };

  // Pending: students who paid nothing for current month
  const paidThisMonth = new Set(
    payments.filter((p) => p.fee_month.slice(0, 7) === currentMonth.slice(0, 7)).map((p) => p.student_id),
  );
  const pending = students.filter((s) => !paidThisMonth.has(s.id) && (s.monthly_fee ?? 0) > 0);

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? id.slice(0, 8);

  return (
    <div>
      <PageHeader eyebrow="[ Fees ]" title="Fee Collection" />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="space-y-3 border border-border p-6">
          <h2 className="font-display text-2xl">Record Payment</h2>
          <div className="space-y-2">
            <Label>Student *</Label>
            <select
              value={form.student_id}
              onChange={(e) => {
                const sid = e.target.value;
                const st = students.find((s) => s.id === sid);
                setForm({ ...form, student_id: sid, amount: st?.monthly_fee?.toString() ?? form.amount });
              }}
              className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm"
              required
            >
              <option value="">— Select —</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Field label="Amount (₹)" type="number" required value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="For month" type="date" value={form.fee_month} onChange={(v) => setForm({ ...form, fee_month: v })} />
            <Field label="Paid on" type="date" value={form.paid_on} onChange={(v) => setForm({ ...form, paid_on: v })} />
          </div>
          <div className="space-y-2">
            <Label>Method</Label>
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank transfer</option>
              <option value="card">Card</option>
            </select>
          </div>
          <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <Button type="submit" className="w-full">Record Payment</Button>
        </form>

        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl mb-3">Pending This Month ({pending.length})</h2>
            {pending.length === 0 ? <p className="text-sm text-muted-foreground">All caught up.</p> : (
              <ul className="space-y-1 text-sm">
                {pending.map((s) => (
                  <li key={s.id} className="border border-border p-2 flex justify-between">
                    <span>{s.name}</span>
                    <span className="font-mono text-xs text-primary">₹{s.monthly_fee}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="font-display text-2xl mb-3">Recent Payments</h2>
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            <ul className="space-y-1 text-sm">
              {payments.slice(0, 20).map((p) => (
                <li key={p.id} className="border border-border p-2 flex justify-between">
                  <div>
                    <div>{studentName(p.student_id)}</div>
                    <div className="text-xs text-muted-foreground">{p.paid_on} · {p.method}</div>
                  </div>
                  <div className="font-mono">₹{p.amount}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
