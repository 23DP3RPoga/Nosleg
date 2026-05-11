/**
 * Pieslēgšanās lapa: divu kolonnu izkārtojums (dekoratīvais bloks + forma).
 * Kļūdas no backend tiek kartētas uz lokalizētiem ziņojumiem pēc teksta fragmentiem.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowLeft, Loader2 } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { z } from "zod";
import { loginSchema, useAuth } from "@/auth";
import { apiFetch, setStoredToken } from "@/lib/api";
import { useI18n, usePageTitle } from "@/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Pieslēgties — Vitalo" },
      { name: "description", content: "Pieslēdzies savam Vitalo kontam." },
    ],
  }),
  component: LoginPage,
});

/** Lauku validācijas kļūdas + kopējs `_form` ziņojums no servera. */
type FieldErrors = Partial<Record<"email" | "password" | "_form", string>>;

function LoginPage() {
  const { t } = useI18n();
  usePageTitle("login.metaTitle");
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({ email: "", password: "" });
  const [verifiedNotice, setVerifiedNotice] = useState(false);

  useEffect(() => {
    // Pēc e-pasta apstiprinājuma Laravel novirza ar ?verified=1
    const q = new URLSearchParams(window.location.search);
    if (q.get("verified") === "1") setVerifiedNotice(true);
  }, []);

  useEffect(() => {
    // Ja jau ir aktīva sesija, nerādīt formu atkārtoti
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const data = loginSchema.parse(form);
      const { data: response } = await apiFetch<{
        token: string;
        user: { id: string; email: string; name: string };
      }>("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
      setStoredToken(response.token);
      navigate({ to: "/dashboard" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fe: FieldErrors = {};
        for (const issue of err.issues) {
          const k = issue.path[0] as keyof FieldErrors;
          if (k && !fe[k]) fe[k] = issue.message;
        }
        setErrors(fe);
      } else if (err instanceof Error) {
        // API ziņojumi bieži angliski — salīdzinām ar apakšvirkņu, lietotājam rādām `t(...)`
        const lower = err.message.toLowerCase();
        const msg =
          lower.includes("invalid login credentials") || lower.includes("invalid credentials")
            ? t("login.err.credentials")
            : lower.includes("verify your email") || lower.includes("email not confirmed")
              ? t("login.err.verify")
              : lower.includes("too many requests")
                ? t("login.err.ratelimit")
                : lower.includes("failed to fetch") || lower.includes("timed out")
                  ? t("login.err.network")
                  : err.message;
        setErrors({ _form: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  /** Atjauno lauku vērtību un notīra tā kļūdu, ja bija. */
  const upd = (key: "email" | "password", v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Kreisā puse: tikai lielos ekrānos — zīmolvedības teksts */}
      <div className="hidden lg:block relative bg-hero overflow-hidden">
        <div className="absolute inset-0 grid place-items-center p-16">
          <div className="max-w-md">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary grid place-items-center">
                <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-display text-3xl text-ink">
                Vitalo<span className="text-primary">.</span>
              </span>
            </Link>
            <h2 className="mt-12 font-display text-5xl text-ink leading-[1.05] text-balance">
              {t("login.side.title")}{" "}
              <span className="italic text-primary">{t("login.side.titleItalic")}</span>.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("login.side.sub")}</p>
          </div>
        </div>
      </div>

      {/* Labā puse: navigācija atpakaļ, forma, kājene */}
      <div className="flex flex-col px-6 py-10 lg:p-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground self-start"
        >
          <ArrowLeft className="w-4 h-4" /> {t("login.back")}
        </Link>

        <div className="flex-1 grid place-items-center py-10">
          <div className="w-full max-w-md">
            <h1 className="font-display text-4xl text-ink">{t("login.h1")}</h1>
            <p className="mt-2 text-muted-foreground">
              {t("login.noAccount")}{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                {t("login.registerLink")}
              </Link>
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
              {verifiedNotice && (
                <div className="p-3 rounded-2xl bg-primary/10 text-primary text-sm">
                  {t("login.verifiedOk")}
                </div>
              )}
              {errors._form && (
                <div className="p-3 rounded-2xl bg-destructive/10 text-destructive text-sm">
                  {errors._form}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {t("login.email")}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => upd("email", e.target.value)}
                  placeholder={t("login.ph.email")}
                  className={`w-full h-12 px-4 rounded-2xl bg-surface border outline-none transition ${
                    errors.email
                      ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                    {t("login.password")}
                  </label>
                  <div className="flex items-center gap-3">
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      {t("login.forgot")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {show ? t("login.hide") : t("login.show")}
                    </button>
                  </div>
                </div>
                <input
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => upd("password", e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-12 px-4 rounded-2xl bg-surface border outline-none transition ${
                    errors.password
                      ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-all disabled:opacity-70 inline-flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("login.submit")}
              </button>
            </form>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Vitalo
        </p>
      </div>
    </div>
  );
}
