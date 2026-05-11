import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, Menu, X, LogOut, LayoutDashboard, Shield, Settings } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/auth";
import { useI18n } from "@/i18n";
import { LanguageToggle } from "@/components/marketing/LanguageToggle";
import { ThemeToggle } from "@/components/marketing/ThemeToggle";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/features", label: t("nav.features") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ] as const;

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  const displayName = profile?.first_name || user?.email?.split("@")[0] || t("nav.account");

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-gradient-primary grid place-items-center shadow-soft">
            <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl tracking-tight text-ink">
            Vitalo<span className="text-primary">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-foreground transition"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="h-10 inline-flex items-center gap-2 px-4 rounded-full text-sm font-medium text-foreground hover:bg-muted transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                {displayName}
              </Link>
              <Link
                to="/settings"
                className="h-10 inline-flex items-center gap-2 px-4 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <Settings className="w-4 h-4" />
                {t("nav.settings")}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="h-10 inline-flex items-center gap-1.5 px-4 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/15 transition"
                >
                  <Shield className="w-4 h-4" /> {t("nav.admin")}
                </Link>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="h-10 inline-flex items-center gap-1.5 px-4 rounded-full text-sm font-medium border border-border hover:bg-muted transition"
              >
                <LogOut className="w-4 h-4" /> {t("nav.signout")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="h-10 inline-flex items-center px-4 rounded-full text-sm font-medium text-foreground hover:bg-muted transition"
              >
                {t("nav.login")}
              </Link>
              <Link
                to="/register"
                className="h-10 inline-flex items-center px-5 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-90 transition shadow-soft"
              >
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden w-10 h-10 grid place-items-center rounded-full hover:bg-muted"
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-surface-elevated">
          <div className="px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-xl text-foreground hover:bg-muted"
                activeProps={{ className: "bg-muted" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 px-1 flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <div className="flex flex-col gap-2 mt-3">
              {user ? (
                <>
                  <Link
                    to="/settings"
                    onClick={() => setOpen(false)}
                    className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-full border border-border text-sm font-medium"
                  >
                    <Settings className="w-4 h-4" /> {t("nav.settings")}
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex-1 h-11 inline-flex items-center justify-center rounded-full bg-foreground text-background text-sm font-medium"
                    >
                      {t("nav.dashboard")}
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="h-11 px-4 inline-flex items-center justify-center rounded-full border border-border text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      <Shield className="w-4 h-4" /> {t("nav.admin")}
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 h-11 inline-flex items-center justify-center rounded-full border border-border text-sm font-medium"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 h-11 inline-flex items-center justify-center rounded-full bg-foreground text-background text-sm font-medium"
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
