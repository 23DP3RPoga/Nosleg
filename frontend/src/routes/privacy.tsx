import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/marketing/PageLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privātuma politika — Vitalo" },
      { name: "description", content: "Kā Vitalo apstrādā un aizsargā tavus personas un veselības datus." },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "1. Kādus datus mēs vācam",
    body: "Mēs vācam tikai tos datus, kurus tu pats ievadi sistēmā — vārdu, e-pastu, veselības rādītājus, dokumentus un atgādinājumu informāciju. Tehniskie dati (sesiju IP, ierīces tips) tiek izmantoti tikai drošībai.",
  },
  {
    title: "2. Kā mēs izmantojam datus",
    body: "Tavi dati tiek izmantoti tikai sistēmas darbībai — atgādinājumiem, vizualizācijām un koplietošanai ar tevis izvēlētajām personām. Mēs nepārdodam datus trešajām pusēm.",
  },
  {
    title: "3. Datu glabāšana un drošība",
    body: "Visi dati tiek glabāti šifrētā veidā ES teritorijā. Piekļuve datiem ir tikai tev un tām personām, kurām tu esi devis piekļuvi caur drošo koplietošanas saiti.",
  },
  {
    title: "4. Tavas tiesības",
    body: "Tev ir tiesības jebkurā laikā lejupielādēt, labot vai dzēst savus datus. Konta dzēšanas gadījumā visi tavi dati tiek neatgriezeniski izdzēsti 30 dienu laikā.",
  },
  {
    title: "5. Sīkdatnes",
    body: "Mēs izmantojam tikai funkcionālas sīkdatnes, kas nepieciešamas sistēmas darbībai. Bez analītikas vai reklāmas izsekošanas.",
  },
  {
    title: "6. Kontaktinformācija",
    body: "Jautājumiem par privātumu raksti uz privacy@vitalo.lv. Mēs atbildam 72 stundu laikā.",
  },
];

function PrivacyPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Juridiski"
        title={<>Privātuma <span className="italic text-primary">politika</span></>}
        subtitle="Pēdējie atjauninājumi: 2025. gada janvāris"
      />
      <section className="mx-auto max-w-3xl px-6 lg:px-10 py-16 lg:py-24 space-y-10">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-2xl text-ink">{s.title}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </section>
    </PageLayout>
  );
}
