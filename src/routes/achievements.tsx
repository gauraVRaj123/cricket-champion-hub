import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements · Stump & Stride" },
      {
        name: "description",
        content:
          "State, zone and national honors won by Stump & Stride students.",
      },
    ],
  }),
  component: AchievementsPage,
});

const honors = [
  { year: "2024", name: "Rohan Verma", honor: "Ranji Trophy debut · Mumbai" },
  {
    year: "2024",
    name: "Sahil Khan",
    honor: "IPL net bowler · Mumbai Indians",
  },
  { year: "2023", name: "Aditya Shetty", honor: "U-19 India A squad" },
  { year: "2023", name: "Neha Rao", honor: "Maharashtra Women U-19" },
  { year: "2022", name: "Krish Patil", honor: "West Zone U-16" },
  { year: "2022", name: "Academy XI", honor: "MCA Inter-Academy Champions" },
  { year: "2021", name: "Ishaan Joshi", honor: "Mumbai U-14 captain" },
  { year: "2020", name: "Vihaan Mehra", honor: "Cooch Behar Trophy debut" },
];

function AchievementsPage() {
  return (
    <>
      <PageHero
        eyebrow="[ 06 ] Achievements"
        title={
          <>
            Receipts, not <span className="text-primary">promises.</span>
          </>
        }
        intro="A partial list of honors won by Stump & Stride students since 2020."
      />
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-16">
            {[
              ["12", "State players"],
              ["03", "Ranji graduates"],
              ["28", "Age-group caps"],
              ["06", "Tournament titles"],
            ].map(([n, l]) => (
              <div key={l} className="bg-background p-8">
                <div className="font-display text-6xl text-primary">{n}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest mt-2 text-muted-foreground">
                  {l}
                </div>
              </div>
            ))}
          </div>

          <ul className="divide-y divide-border border-y border-border">
            {honors.map((h, i) => (
              <li
                key={i}
                className="py-6 flex flex-wrap items-baseline gap-x-8 gap-y-2 hover:bg-card transition-colors px-4"
              >
                <span className="font-mono text-sm text-primary w-16">
                  {h.year}
                </span>
                <span className="font-display text-2xl flex-1 min-w-[180px]">
                  {h.name}
                </span>
                <span className="text-sm text-muted-foreground">{h.honor}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
