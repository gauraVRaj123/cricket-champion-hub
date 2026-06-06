import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs & Batches · Stump & Stride" },
      {
        name: "description",
        content:
          "Foundation, Elite Performance, Weekend Warrior and 1-on-1 Masterclass programs. Morning and evening batches across age groups.",
      },
    ],
  }),
  component: ProgramsPage,
});

const programs = [
  {
    name: "Foundation",
    age: "Age 7 — 12",
    schedule: "Sat & Sun · 07:00 — 10:00",
    fee: "₹ 2,500 / mo",
    points: [
      "Stance, grip, basic technique",
      "Soft-ball match play",
      "Fitness fundamentals",
    ],
  },
  {
    name: "Elite Performance",
    age: "Age 13 — 19",
    schedule: "Mon–Fri · 16:00 — 19:00",
    fee: "₹ 4,200 / mo",
    points: [
      "Video analysis every session",
      "Match scenario training",
      "Strength & conditioning",
    ],
    highlight: true,
  },
  {
    name: "Morning Elite",
    age: "U-14, U-16, U-19",
    schedule: "Mon · Wed · Fri · 06:00 — 09:00",
    fee: "₹ 3,500 / mo",
    points: [
      "Pre-school turf wickets",
      "Selector-grade match simulation",
      "Quarterly assessment reports",
    ],
  },
  {
    name: "Pro Masterclass",
    age: "All ages · By invitation",
    schedule: "Flexible · 1-on-1",
    fee: "From ₹ 1,200 / hr",
    points: [
      "Personalised plan with a head coach",
      "Biomechanics & workload management",
      "Tournament prep",
    ],
  },
];

function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="[ 02 ] Programs"
        title={
          <>
            Pick your <span className="text-primary">batch.</span>
          </>
        }
        intro="Four programs, structured by age and intent. Every batch caps at 18 students so every student gets reps with a coach."
      />

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-px bg-border">
          {programs.map((p) => (
            <div
              key={p.name}
              className={
                (p.highlight
                  ? "bg-foreground text-background "
                  : "bg-background ") + "p-10"
              }
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="font-display text-4xl">{p.name}</div>
                  <div className="font-mono text-xs uppercase tracking-widest mt-2 opacity-60">
                    {p.age}
                  </div>
                </div>
                {p.highlight && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                    Most picked
                  </span>
                )}
              </div>
              <ul className="space-y-2 text-sm mb-8">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-3">
                    <span className="text-primary">▸</span> {pt}
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-current/20 flex justify-between items-center">
                <div>
                  <div className="font-display text-2xl">{p.fee}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mt-1">
                    {p.schedule}
                  </div>
                </div>
                <Link
                  to="/admissions"
                  className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:text-primary"
                >
                  Enroll →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
