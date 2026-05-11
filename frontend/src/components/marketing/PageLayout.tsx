/**
 * Vienots iekšējo mārketinga lapu izkārtojums: galvenā izvēlne, saturs, kājene.
 * `PageHero` — atkārtoti lietojams virsrakstu bloks ar `eyebrow` / `subtitle`.
 */
import { ReactNode } from "react";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="mx-auto max-w-5xl px-6 lg:px-10 pt-20 pb-16 lg:pt-28 lg:pb-24 text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
          {eyebrow}
        </span>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl lg:text-7xl text-ink leading-[1.02] text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
