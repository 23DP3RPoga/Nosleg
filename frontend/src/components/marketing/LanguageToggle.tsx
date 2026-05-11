import { Languages } from "lucide-react";
import { useI18n, Lang } from "@/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();

  const opts: { code: Lang; label: string }[] = [
    { code: "lv", label: "LV" },
    { code: "en", label: "EN" },
  ];

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated/60 p-1 text-xs ${className}`}
      role="group"
      aria-label="Language"
    >
      <Languages className="w-3.5 h-3.5 text-muted-foreground ml-2 mr-0.5" />
      {opts.map((o) => (
        <button
          type="button"
          key={o.code}
          onClick={() => setLang(o.code)}
          className={`px-2.5 py-1 rounded-full font-medium transition ${
            lang === o.code
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={lang === o.code}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
