import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/marketing/PageLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Lietošanas noteikumi — Vitalo" },
      { name: "description", content: "Vitalo platformas lietošanas noteikumi." },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "1. Pakalpojuma apraksts",
    body: "Vitalo ir personīgās veselības pārvaldības platforma. Tā nav medicīnisks instruments un nesniedz diagnozes vai ārstēšanas ieteikumus. Vienmēr konsultējies ar ārstu.",
  },
  {
    title: "2. Konta izveide",
    body: "Lai izmantotu Vitalo, jāizveido konts ar derīgu e-pastu. Lietotājs ir atbildīgs par paroles drošību un par visu savā kontā veikto darbību.",
  },
  {
    title: "3. Atļauta lietošana",
    body: "Vitalo drīkst izmantot tikai personīgām veselības rūpēm. Aizliegts augšupielādēt nelegālu saturu vai izmantot sistēmu citu personu kaitējumam.",
  },
  {
    title: "4. Datu koplietošana",
    body: "Lietotājs pats izvēlas, ar kurām personām dalīties ar saviem datiem. Vitalo nav atbildīgs par to, kā saņēmējs izmanto kopīgoto informāciju.",
  },
  {
    title: "5. Pakalpojuma izmaiņas",
    body: "Mēs paturam tiesības mainīt vai pārtraukt pakalpojumu, brīdinot lietotājus vismaz 30 dienas iepriekš.",
  },
  {
    title: "6. Atbildības ierobežojums",
    body: "Vitalo netiek garantēts kā medicīnisks instruments. Mēs nesam atbildību tikai par sistēmas darbību un datu drošību mūsu infrastruktūrā.",
  },
];

function TermsPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Juridiski"
        title={<>Lietošanas <span className="italic text-primary">noteikumi</span></>}
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
