import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Book a Free Trial · Stump & Stride" },
      {
        name: "description",
        content:
          "Book a free trial session, view fee structure and reserve your batch spot. Razorpay & UPI accepted.",
      },
    ],
  }),
  component: AdmissionsPage,
});

function AdmissionsPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="[ 04 ] Admissions"
        title={
          <>
            Reserve your <span className="text-primary">trial slot.</span>
          </>
        }
        intro="One free 90-minute trial. We assess, you decide. Slots fill fast in season — pick a date below."
      />

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="lg:col-span-3 bg-card border border-border p-8 md:p-10 space-y-6"
          >
            <div className="font-mono text-xs text-primary uppercase tracking-widest">
              Trial Booking Form
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Student Name" name="name" required />
              <Field label="Age" name="age" type="number" required />
              <Field label="Parent / Guardian" name="parent" required />
              <Field label="Phone (WhatsApp)" name="phone" required />
              <Field
                label="Email"
                name="email"
                type="email"
                className="sm:col-span-2"
                required
              />
            </div>
            <div>
              <Label>Preferred batch</Label>
              <select
                name="batch"
                className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary"
              >
                <option>Morning Elite (06:00 – 09:00)</option>
                <option>Evening Grind (16:00 – 19:00)</option>
                <option>Weekend Warrior (Sat & Sun)</option>
                <option>Foundation (U-12)</option>
              </select>
            </div>
            <div>
              <Label>Trial date</Label>
              <input
                type="date"
                name="date"
                required
                className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-foreground transition-colors w-full sm:w-auto"
            >
              {sent ? "✓ Slot Reserved" : "Book Free Trial"}
            </button>
            {sent && (
              <p className="text-sm text-muted-foreground">
                Thanks — our team will confirm on WhatsApp within 4 hours.
              </p>
            )}
          </form>

          <aside className="lg:col-span-2 space-y-8">
            <div className="bg-foreground text-background p-8">
              <div className="font-mono text-xs text-primary uppercase tracking-widest mb-3">
                Fee Structure
              </div>
              <ul className="divide-y divide-background/10">
                {[
                  ["Foundation", "₹ 2,500 / mo"],
                  ["Weekend Warrior", "₹ 2,500 / mo"],
                  ["Morning Elite", "₹ 3,500 / mo"],
                  ["Evening Grind", "₹ 4,200 / mo"],
                  ["Pro Masterclass", "From ₹ 1,200 / hr"],
                ].map(([n, f]) => (
                  <li key={n} className="flex justify-between py-3 text-sm">
                    <span>{n}</span>
                    <span className="font-mono">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="font-mono text-[10px] uppercase tracking-widest text-background/50 mt-6">
                Payments via Razorpay · UPI · Bank Transfer
              </div>
            </div>

            <div className="border border-border p-8">
              <div className="font-mono text-xs text-primary uppercase tracking-widest mb-3">
                What to bring
              </div>
              <ul className="space-y-2 text-sm">
                <li>▸ Whites or sports kit</li>
                <li>▸ Cricket shoes (spikes optional)</li>
                <li>▸ Personal bat & pads if you own them</li>
                <li>▸ Water bottle & a snack</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
      {children}
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}
