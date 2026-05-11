import { useState } from "react";
import { Plus } from "lucide-react";
import { useI18n } from "@/i18n";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const { t } = useI18n();

  const faqs = [1, 2, 3, 4].map((i) => ({
    q: t(`faq.${i}.q`),
    a: t(`faq.${i}.a`),
  }));

  return (
    <section id="faq" className="py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
            {t("faq.eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl text-ink text-balance leading-[1.05]">
            {t("faq.title")}
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className="rounded-2xl bg-surface-elevated border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-medium text-foreground">{f.q}</span>
                <Plus
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    open === i ? "rotate-45" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                    {f.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
