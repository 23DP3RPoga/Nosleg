import { Link } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { Heart, Pill, CalendarCheck, TrendingUp } from "lucide-react";
import { useI18n, type Lang } from "@/i18n";

const heartValues = [68, 72, 70, 76, 74, 71, 73];

const chartDays: Record<Lang, string[]> = {
  lv: ["P", "O", "T", "C", "Pk", "S", "Sv"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export function HealthPreview() {
  const { t, lang } = useI18n();
  const heartData = chartDays[lang].map((d, i) => ({ d, v: heartValues[i]! }));

  return (
    <div key={lang} className="relative">
      <div className="absolute -inset-8 bg-gradient-primary opacity-20 blur-3xl rounded-full" />

      <motion.div className="relative grid grid-cols-6 grid-rows-6 gap-3 h-[520px]">
        <motion.div
          whileHover={{ y: -4 }}
          className="col-span-6 row-span-3 rounded-3xl bg-surface-elevated border border-border shadow-elevated p-5 flex flex-col"
        >
          <motion.div className="flex items-center justify-between">
            <motion.div className="flex items-center gap-2.5">
              <motion.div className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center">
                <Heart className="w-4.5 h-4.5 text-primary" />
              </motion.div>
              <motion.div>
                <p className="text-xs text-muted-foreground">{t("hp.chart.sub")}</p>
                <p className="font-display text-2xl text-ink leading-none mt-1">
                  72 <span className="text-sm text-muted-foreground font-sans">{t("hp.chart.bpm")}</span>
                </p>
              </motion.div>
            </motion.div>
            <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {t("hp.chart.stable")}
            </span>
          </motion.div>

          <motion.div className="flex-1 -mx-2 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={heartData}>
                <defs>
                  <linearGradient id="hr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary-glow)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary-glow)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="d"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis hide domain={["dataMin - 4", "dataMax + 4"]} />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#hr)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="col-span-3 row-span-3 rounded-3xl bg-ink text-background p-5 flex flex-col justify-between"
        >
          <motion.div className="flex items-center gap-2 text-xs opacity-70">
            <Pill className="w-4 h-4" />
            {t("hp.pill.today")}
          </motion.div>
          <motion.div>
            <p className="font-display text-3xl leading-tight">{t("hp.pill.name")}</p>
            <p className="text-sm opacity-70 mt-1">{t("hp.pill.meta")}</p>
          </motion.div>
          <motion.div className="flex gap-2">
            <Link
              to="/register"
              className="flex-1 h-9 rounded-full bg-background text-foreground text-xs font-medium grid place-items-center hover:opacity-90 transition"
            >
              {t("hp.pill.reg")}
            </Link>
            <Link
              to="/features"
              className="h-9 px-3 rounded-full border border-background/20 text-xs grid place-items-center hover:bg-background/10 transition"
            >
              {t("hp.pill.features")}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="col-span-3 row-span-3 rounded-3xl bg-warm/40 border border-warm/40 p-5 flex flex-col justify-between"
        >
          <motion.div className="flex items-center gap-2 text-xs text-warm-foreground/80">
            <CalendarCheck className="w-4 h-4" />
            {t("hp.appt.when")}
          </motion.div>
          <motion.div>
            <p className="font-display text-2xl text-ink leading-tight">{t("hp.appt.doc")}</p>
            <p className="text-sm text-warm-foreground/80 mt-1">{t("hp.appt.meta")}</p>
          </motion.div>
          <motion.div className="flex items-center gap-2">
            <motion.div className="flex -space-x-2">
              <motion.div className="w-7 h-7 rounded-full bg-primary/80 border-2 border-warm/40" />
              <motion.div className="w-7 h-7 rounded-full bg-accent border-2 border-warm/40" />
            </motion.div>
            <span className="text-xs text-warm-foreground/80">{t("hp.appt.note")}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
