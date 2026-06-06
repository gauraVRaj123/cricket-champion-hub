import { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="inline-block bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold tracking-[0.25em] uppercase mb-6">
          {eyebrow}
        </div>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.88] text-balance max-w-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            {intro}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
