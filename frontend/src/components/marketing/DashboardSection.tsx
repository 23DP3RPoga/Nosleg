import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useI18n } from "@/i18n";

const monthsLv = ["Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt"];
const monthsEn = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const values = [
  { sys: 132, dia: 86 },
  { sys: 128, dia: 84 },
  { sys: 125, dia: 82 },
  { sys: 122, dia: 80 },
  { sys: 120, dia: 79 },
  { sys: 118, dia: 78 },
];

export function DashboardSection() {
  const { t, lang } = useI18n();
  const months = lang === "en" ? monthsEn : monthsLv;
  const bp = values.map((v, i) => ({ month: months[i], ...v }));
  const bullets = [t("dash.bullet.1"), t("dash.bullet.2"), t("dash.bullet.3")];

  return (
    <section id="dashboard" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
              {t("dash.eyebrow")}
            </span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl text-ink text-balance leading-[1.05]">
              {t("dash.title.1")}{" "}
              <span className="italic text-primary">{t("dash.title.italic")}</span>{" "}
              {t("dash.title.2")}
            </h2>
            <p className="mt-5 text-lg text-muted-foreground text-balance">
              {t("dash.subtitle")}
            </p>

            <ul className="mt-8 space-y-4">
              {bullets.map((tx) => (
                <li key={tx} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/15 grid place-items-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="text-foreground">{tx}</span>
                </li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl bg-surface-elevated border border-border shadow-elevated p-6 lg:p-8">
              <div className="flex items-baseline justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("dash.bp")}</p>
                  <h3 className="font-display text-3xl text-ink mt-1">118 / 78</h3>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> {t("dash.systolic")}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-warm" /> {t("dash.diastolic")}
                  </span>
                </div>
              </div>

              <div className="h-72 mt-6 -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bp} barCategoryGap="22%">
                    <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface-elevated)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      cursor={{ fill: "var(--color-muted)" }}
                    />
                    <Bar dataKey="sys" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="dia" fill="var(--color-warm)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
