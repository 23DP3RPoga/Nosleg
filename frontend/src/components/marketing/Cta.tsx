import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n";

export function Cta() {
  const { t } = useI18n();
  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] bg-ink text-background p-10 lg:p-16">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-warm/30 blur-3xl" />

          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-balance">
              {t("cta.title.1")} <span className="italic opacity-80">{t("cta.title.italic")}</span>.
            </h2>
            <p className="mt-5 text-lg opacity-70 text-balance">{t("cta.subtitle")}</p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="group h-12 px-6 rounded-full bg-background text-foreground font-medium inline-flex items-center justify-center gap-2 hover:bg-background/90 transition"
              >
                {t("cta.primary")}
                <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/contact"
                className="h-12 px-6 rounded-full border border-background/20 text-background font-medium hover:bg-background/10 transition inline-flex items-center justify-center"
              >
                {t("cta.secondary")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
