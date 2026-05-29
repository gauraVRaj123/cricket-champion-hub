import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/PageHero";
import coaching from "@/assets/coaching.jpg";
import batter from "@/assets/hero-batter.jpg";
import bowler from "@/assets/bowler.jpg";

export const Route = createFileRoute("/coaches")({
  head: () => ({
    meta: [
      { title: "Coaches · Stump & Stride" },
      {
        name: "description",
        content:
          "Meet our BCCI-certified head coach, bowling specialist and batting consultant.",
      },
      { property: "og:image", content: coaching },
    ],
  }),
  component: CoachesPage,
});

const fallbackCoaches = [
  {
    name: "Rajesh Kulkarni",
    role: "Head Performance Coach",
    cert: "BCCI Level 3",
    bio: "Former first-class player (Mumbai). 15 years coaching, six age-group title winners.",
    img: coaching,
  },
  {
    name: "Arjun Nair",
    role: "Bowling Specialist",
    cert: "BCCI Level 2",
    bio: "Biomechanics and fast-bowling workload. Mentored two Ranji debutants in 2023.",
    img: bowler,
  },
  {
    name: "Sanjay Mehta",
    role: "Batting Consultant",
    cert: "BCCI Level 3",
    bio: "Long-form temperament and shot construction. Ex-MCA selector panel.",
    img: batter,
  },
];

function CoachesPage() {
  const [coaches, setCoaches] = useState(fallbackCoaches);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("coaches")
        .select("name, role, certifications, bio, photo_url")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (data && data.length > 0) {
        setCoaches(
          data.map((c) => ({
            name: c.name,
            role: c.role,
            cert: c.certifications || "",
            bio: c.bio || "",
            img: c.photo_url || coaching,
          })),
        );
      }
    })();
  }, []);

  return (
    <>
      <PageHero
        eyebrow="[ 03 ] Coaches"
        title={<>The people <span className="text-primary">in the nets.</span></>}
        intro="No celebrity ambassadors. Just working coaches with first-class CVs and the patience to fix what's broken."
      />
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {coaches.map((c) => (
            <article key={c.name} className="group">
              <img
                src={c.img}
                alt={c.name}
                loading="lazy"
                width={1024}
                height={1280}
                className="w-full aspect-[4/5] object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="mt-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                  {c.cert}
                </div>
                <h3 className="font-display text-3xl mt-2">{c.name}</h3>
                <div className="text-sm font-semibold mt-1">{c.role}</div>
                <p className="text-muted-foreground text-sm mt-3 text-pretty">
                  {c.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}