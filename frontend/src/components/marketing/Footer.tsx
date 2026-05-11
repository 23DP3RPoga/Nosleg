import { Activity } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary grid place-items-center">
                <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl text-ink">
                Vitalo<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {t("footer.product")}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/features" className="text-foreground hover:text-primary">{t("nav.features")}</Link></li>
              <li><Link to="/about" className="text-foreground hover:text-primary">{t("nav.about")}</Link></li>
              <li><Link to="/contact" className="text-foreground hover:text-primary">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {t("footer.legal")}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/privacy" className="text-foreground hover:text-primary">{t("footer.privacy")}</Link></li>
              <li><Link to="/terms" className="text-foreground hover:text-primary">{t("footer.terms")}</Link></li>
              <li><Link to="/login" className="text-foreground hover:text-primary">{t("nav.login")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Vitalo. {t("footer.copyright")}</p>
          <p>{t("footer.made")}</p>
        </div>
      </div>
    </footer>
  );
}
