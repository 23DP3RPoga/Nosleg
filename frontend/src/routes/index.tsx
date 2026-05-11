import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { DashboardSection } from "@/components/marketing/DashboardSection";
import { Compare } from "@/components/marketing/Compare";
import { Faq } from "@/components/marketing/Faq";
import { Cta } from "@/components/marketing/Cta";
import { Footer } from "@/components/marketing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vitalo — Tava veselība, vienuviet" },
      {
        name: "description",
        content:
          "Vitalo apvieno tavu medicīnisko vēsturi, ārstu vizītes, zāļu atgādinājumus un veselības rādītājus vienā skaistā, drošā un vizuālā platformā.",
      },
      { property: "og:title", content: "Vitalo — Tava veselība, vienuviet" },
      {
        property: "og:description",
        content:
          "Personīgā veselības centrāle ar atgādinājumiem, vizualizācijām un drošu datu koplietošanu ar ārstiem.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Features />
        <DashboardSection />
        <Compare />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
