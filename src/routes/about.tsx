import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import grounds from "@/assets/academy-grounds.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Stump & Stride Cricket Academy" },
      {
        name: "description",
        content:
          "How Stump & Stride trains Mumbai's next generation of cricketers — our philosophy, facilities and history.",
      },
      { property: "og:title", content: "About · Stump & Stride" },
      { property: "og:image", content: grounds },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="[ 01 ] About"
        title={
          <>
            Built on the <span className="text-primary">grind.</span>
            <br /> Not the highlight reel.
          </>
        }
        intro="Stump & Stride was founded in 2008 by a small group of first-class cricketers tired of academies that promised the moon and delivered cones and casual nets. We run a results-driven program for kids and young adults who want to actually compete."
      />

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
          <img
            src={grounds}
            alt="Academy ground at sunset"
            loading="lazy"
            width={1920}
            height={1080}
            className="w-full aspect-[4/3] object-cover rounded-sm"
          />
          <div className="space-y-10">
            {[
              [
                "Philosophy",
                "Repetition with intent. Every drill we run has a measurable outcome — bat speed, line consistency, footwork timing. We don't waste sessions.",
              ],
              [
                "Facilities",
                "Eight turf wickets, four synthetic nets, an indoor video lab, a strength gym and a recovery room with cold-water immersion.",
              ],
              [
                "Pathway",
                "From U-10 foundation through Mumbai Cricket Association trials. We've placed players in 12 BCCI age-group squads since 2019.",
              ],
            ].map(([h, p]) => (
              <div key={h}>
                <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary mb-3">
                  {h}
                </div>
                <p className="text-lg text-pretty">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}