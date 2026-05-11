import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, HeartPulse, Sparkles } from "lucide-react";
import { HealthPreview } from "./HealthPreview";
import { useI18n } from "@/i18n";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/70 px-3 py-1.5 text-xs text-muted-foreground"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {t("hero.badge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] text-balance text-ink"
            >
              {t("hero.title.1")}{" "}
              <span className="italic text-primary">{t("hero.title.italic")}</span>{" "}
              {t("hero.title.2")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-lg text-muted-foreground max-w-xl text-balance"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link
                to="/register"
                className="group h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-all inline-flex items-center justify-center gap-2"
              >
                {t("hero.cta.primary")}
                <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/features"
                className="h-12 px-6 rounded-full border border-border bg-surface-elevated/60 text-foreground font-medium hover:bg-surface-elevated transition inline-flex items-center justify-center gap-2"
              >
                {t("hero.cta.secondary")}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t("hero.trust.gdpr")}
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-primary" />
                {t("hero.trust.devices")}
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {t("hero.trust.noads")}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative"
          >
            <HealthPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
