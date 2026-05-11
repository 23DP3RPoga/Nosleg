import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/marketing/PageLayout";
import {
  HeartPulse, Bell, LineChart, Share2, Watch, FileText, Search, ShieldCheck,
  Calendar, Users, Database, Sparkles, ArrowRight,
} from "lucide-react";
import { useI18n, usePageTitle } from "@/i18n";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Iespējas — Vitalo" },
      { name: "description", content: "Visas Vitalo iespējas: veselības rādītāji, atgādinājumi, vizualizācijas, viedierīču sinhronizācija un drošā koplietošana ar ārstiem." },
      { property: "og:title", content: "Iespējas — Vitalo" },
      { property: "og:description", content: "Visas Vitalo iespējas vienā vietā." },
    ],
  }),
  component: FeaturesPage,
});

const GROUP_DEFS: {
  titleKey: string;
  items: { icon: typeof HeartPulse; titleKey: string; descKey: string }[];
}[] = [
  {
    titleKey: "featuresPage.g0.title",
    items: [
      { icon: HeartPulse, titleKey: "featuresPage.g0.i0.t", descKey: "featuresPage.g0.i0.d" },
      { icon: LineChart, titleKey: "featuresPage.g0.i1.t", descKey: "featuresPage.g0.i1.d" },
      { icon: Database, titleKey: "featuresPage.g0.i2.t", descKey: "featuresPage.g0.i2.d" },
      { icon: FileText, titleKey: "featuresPage.g0.i3.t", descKey: "featuresPage.g0.i3.d" },
    ],
  },
  {
    titleKey: "featuresPage.g1.title",
    items: [
      { icon: Bell, titleKey: "featuresPage.g1.i0.t", descKey: "featuresPage.g1.i0.d" },
      { icon: Calendar, titleKey: "featuresPage.g1.i1.t", descKey: "featuresPage.g1.i1.d" },
      { icon: Sparkles, titleKey: "featuresPage.g1.i2.t", descKey: "featuresPage.g1.i2.d" },
      { icon: Watch, titleKey: "featuresPage.g1.i3.t", descKey: "featuresPage.g1.i3.d" },
    ],
  },
  {
    titleKey: "featuresPage.g2.title",
    items: [
      { icon: Share2, titleKey: "featuresPage.g2.i0.t", descKey: "featuresPage.g2.i0.d" },
      { icon: Users, titleKey: "featuresPage.g2.i1.t", descKey: "featuresPage.g2.i1.d" },
      { icon: Search, titleKey: "featuresPage.g2.i2.t", descKey: "featuresPage.g2.i2.d" },
      { icon: ShieldCheck, titleKey: "featuresPage.g2.i3.t", descKey: "featuresPage.g2.i3.d" },
    ],
  },
];

function FeaturesPage() {
  const { t } = useI18n();
  usePageTitle("featuresPage.hero.eyebrow");

  return (
    <PageLayout>
      <PageHero
        eyebrow={t("featuresPage.hero.eyebrow")}
        title={
          <>
            {t("featuresPage.hero.titleBefore")}{" "}
            <span className="italic text-primary">{t("featuresPage.hero.titleItalic")}</span>
            {t("featuresPage.hero.titleAfter")}
          </>
        }
        subtitle={t("featuresPage.hero.subtitle")}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24 space-y-20">
        {GROUP_DEFS.map((g) => (
          <section key={g.titleKey}>
            <h2 className="font-display text-3xl sm:text-4xl text-ink">{t(g.titleKey)}</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {g.items.map((f) => (
                <div
                  key={f.titleKey}
                  className="group p-6 rounded-3xl bg-surface-elevated border border-border hover:border-primary/40 hover:shadow-soft transition-all"
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 grid place-items-center group-hover:bg-primary transition-colors">
                    <f.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="mt-5 font-display text-xl text-ink">{t(f.titleKey)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="rounded-[2rem] bg-ink text-background p-10 lg:p-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl">{t("featuresPage.cta.title")}</h2>
          <p className="mt-3 opacity-70 max-w-xl mx-auto">{t("featuresPage.cta.sub")}</p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-background text-foreground font-medium hover:bg-background/90 transition group"
          >
            {t("featuresPage.cta.btn")}
            <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
