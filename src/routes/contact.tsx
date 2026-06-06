import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · Stump & Stride" },
      {
        name: "description",
        content:
          "Visit our ground, call, WhatsApp or email Stump & Stride Cricket Academy, Mumbai.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="[ 07 ] Contact"
        title={
          <>
            Come <span className="text-primary">visit.</span>
          </>
        }
        intro="Walk-ins welcome between 06:00–09:00 and 16:00–19:00. Or reach us on WhatsApp anytime."
      />
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {[
              [
                "Ground",
                "Andheri Sports Complex\nVeera Desai Rd, Mumbai 400053",
              ],
              ["Phone", "+91 98xxx 43210"],
              ["WhatsApp", "+91 98xxx 43210"],
              ["Email", "trials@stumpandstride.in"],
              ["Hours", "Mon–Sat · 06:00–09:00 & 16:00–19:00"],
            ].map(([h, v]) => (
              <div key={h} className="border-b border-border pb-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
                  {h}
                </div>
                <div className="font-display text-2xl whitespace-pre-line">
                  {v}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-muted border border-border aspect-square lg:aspect-auto overflow-hidden">
            <iframe
              title="Stump & Stride location"
              src="https://www.google.com/maps?q=Andheri+Sports+Complex+Mumbai&output=embed"
              className="w-full h-full min-h-[400px] grayscale"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
