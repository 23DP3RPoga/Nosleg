import { motion } from "framer-motion";
import {
  HeartPulse, Bell, LineChart, Share2, Watch, FileText, Search, ShieldCheck,
} from "lucide-react";
import { useI18n } from "@/i18n";

const icons = [HeartPulse, Bell, LineChart, Watch, FileText, Share2, Search, ShieldCheck];

export function Features() {
  const { t } = useI18n();
  const features = icons.map((Icon, idx) => ({
    icon: Icon,
    title: t(`features.${idx + 1}.t`),
    text: t(`features.${idx + 1}.d`),
  }));

  return (
    <section id="features" className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
            {t("features.eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl text-ink text-balance leading-[1.05]">
            {t("features.title.1")}{" "}
            <span className="italic text-primary">{t("features.title.italic")}</span>.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground text-balance">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group p-6 rounded-3xl bg-surface-elevated border border-border hover:border-primary/40 hover:shadow-soft transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-primary/10 grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="mt-5 font-display text-xl text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
