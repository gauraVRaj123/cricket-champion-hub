import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import batter from "@/assets/hero-batter.jpg";
import bowler from "@/assets/bowler.jpg";
import coaching from "@/assets/coaching.jpg";
import grounds from "@/assets/academy-grounds.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery · Stump & Stride" },
      {
        name: "description",
        content:
          "Training sessions, match days and academy life at Stump & Stride.",
      },
    ],
  }),
  component: GalleryPage,
});

const shots = [
  { src: batter, alt: "Batter mid-drive in the nets", tall: true },
  { src: grounds, alt: "Academy grounds at sunset" },
  { src: bowler, alt: "Fast bowler in delivery stride", tall: true },
  { src: coaching, alt: "Coach instructing students" },
  { src: grounds, alt: "Empty nets at golden hour" },
  { src: batter, alt: "Batter close-up" },
];

function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="[ 05 ] Gallery"
        title={
          <>
            Inside the <span className="text-primary">grind.</span>
          </>
        }
        intro="Photographs from training, match days and tournament travel."
      />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {shots.map((s, i) => (
            <figure
              key={i}
              className={
                "overflow-hidden bg-muted " +
                (s.tall ? "row-span-2 aspect-[3/4]" : "aspect-[4/3]")
              }
            >
              <img
                src={s.src}
                alt={s.alt}
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
