import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/marketing/PageLayout";
import { Heart, Target, Eye, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Par mums — Vitalo" },
      { name: "description", content: "Vitalo misija ir padarīt veselības pārvaldību vienkāršu, vizuālu un drošu ikvienam." },
      { property: "og:title", content: "Par mums — Vitalo" },
      { property: "og:description", content: "Mūsu stāsts un misija." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Heart, title: "Cilvēks pirmajā vietā", text: "Katra funkcija sākas ar jautājumu — vai tas patiešām palīdz lietotājam?" },
  { icon: Target, title: "Skaidrība", text: "Sarežģīti dati, vienkāršs skats. Bez liekiem vārdiem un troksņa." },
  { icon: Eye, title: "Caurspīdība", text: "Tu vienmēr zini, kur atrodas tavi dati un kurš tos var redzēt." },
  { icon: Sparkles, title: "Skaistums un funkcija", text: "Ticam, ka veselības rīki var būt arī patīkami lietot." },
];

function AboutPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Par mums"
        title={<>Veselība <span className="italic text-primary">ir personīga</span>. Tās pārvaldība arī.</>}
        subtitle="Vitalo radās no vienkāršas problēmas — neviens nezina, kur pieturēt savu veselības stāstu."
      />

      <section className="mx-auto max-w-4xl px-6 lg:px-10 py-16 lg:py-24">
        <div className="prose-custom space-y-6 text-lg text-foreground/90 leading-relaxed">
          <p>
            Mēs sākām ar novērojumu: cilvēki Latvijā un visā pasaulē izmanto
            burtnīcas, telefonu piezīmes un dažādas lietotnes, lai sekotu
            asinsspiedienam, zāļu lietošanai vai ārstu vizītēm. Sistēmas, kas
            piedāvā risinājumu, bieži ir novecojušas, sadrumstalotas vai veidotas
            iestādēm, nevis cilvēkiem.
          </p>
          <p>
            <strong className="text-ink font-semibold">Vitalo</strong> ir mēģinājums to izlabot. Mēs apvienojam medicīnisko vēsturi,
            atgādinājumus, vizualizācijas un drošo datu koplietošanu vienā skaistā,
            intuitīvā platformā — kas pieder tev, nevis sistēmai.
          </p>
          <p>
            Mūsu mērķis nav aizvietot ārstu vai E-veselību. Mēs ticam, ka
            informēts pacients ir labāks pacients — un ka tehnoloģija var palīdzēt
            cilvēkiem rūpēties par sevi gudrāk.
          </p>
        </div>
      </section>

      <section className="bg-surface py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Mūsu vērtības</span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl text-ink">
              Kas mūs <span className="italic text-primary">virza</span>.
            </h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 gap-4">
            {values.map((v) => (
              <div key={v.title} className="p-8 rounded-3xl bg-surface-elevated border border-border">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 grid place-items-center">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="mt-5 font-display text-2xl text-ink">{v.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          {[
            { n: "12K+", l: "Lietotāji" },
            { n: "98%", l: "Lietotāju apmierinātība" },
            { n: "GDPR", l: "Atbilstība" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-6xl text-primary">{s.n}</p>
              <p className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition group"
          >
            Sazināties ar mums
            <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
