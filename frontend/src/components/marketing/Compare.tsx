import { Check, Minus } from "lucide-react";
import { useI18n } from "@/i18n";

const data = [
  { key: "compare.row.1", a: true, b: "partial", c: "partial", d: "partial" },
  { key: "compare.row.2", a: true, b: false, c: true, d: false },
  { key: "compare.row.3", a: true, b: false, c: false, d: false },
  { key: "compare.row.4", a: true, b: false, c: true, d: false },
  { key: "compare.row.5", a: true, b: true, c: true, d: true },
  { key: "compare.row.6", a: true, b: false, c: true, d: true },
  { key: "compare.row.7", a: true, b: true, c: false, d: false },
] as const;

export function Compare() {
  const { t } = useI18n();

  const cell = (v: boolean | "partial") => {
    if (v === true)
      return (
        <div className="w-7 h-7 rounded-full bg-primary/15 grid place-items-center mx-auto">
          <Check className="w-4 h-4 text-primary" strokeWidth={3} />
        </div>
      );
    if (v === false)
      return (
        <div className="w-7 h-7 rounded-full bg-muted grid place-items-center mx-auto">
          <Minus className="w-4 h-4 text-muted-foreground" />
        </div>
      );
    return <span className="text-xs text-muted-foreground">{t("compare.partial")}</span>;
  };

  return (
    <section id="compare" className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
            {t("compare.eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl text-ink text-balance leading-[1.05]">
            {t("compare.title.1")}{" "}
            <span className="italic text-primary">{t("compare.title.italic")}</span>?
          </h2>
        </div>

        <div className="mt-12 rounded-3xl bg-surface-elevated border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("compare.col.feature")}
                  </th>
                  <th className="p-5 text-center">
                    <div className="font-display text-lg text-primary">Vitalo</div>
                  </th>
                  <th className="p-5 text-center text-sm font-medium text-muted-foreground">
                    E-veselība
                  </th>
                  <th className="p-5 text-center text-sm font-medium text-muted-foreground">
                    MyChart
                  </th>
                  <th className="p-5 text-center text-sm font-medium text-muted-foreground">
                    ZAVA
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={r.key} className={i % 2 === 0 ? "bg-surface/40" : ""}>
                    <td className="p-5 text-sm text-foreground">{t(r.key)}</td>
                    <td className="p-5">{cell(r.a)}</td>
                    <td className="p-5">{cell(r.b)}</td>
                    <td className="p-5">{cell(r.c)}</td>
                    <td className="p-5">{cell(r.d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
