import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { z } from "zod";
import { registerSchema, useAuth } from "@/auth";
import { apiFetch, setStoredToken } from "@/lib/api";
import { useI18n, usePageTitle } from "@/i18n";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Reģistrēties — Vitalo" },
      {
        name: "description",
        content: "Izveido savu Vitalo kontu bez maksas un sāc rūpēties par savu veselību gudrāk.",
      },
    ],
  }),
  component: RegisterPage,
});

const PERK_KEYS = ["register.perk0", "register.perk1", "register.perk2", "register.perk3"] as const;

type FieldErrors = Partial<
  Record<"firstName" | "lastName" | "email" | "password" | "acceptTerms" | "_form", string>
>;

function RegisterPage() {
  const { t } = useI18n();
  usePageTitle("register.metaTitle");
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    acceptTerms: false,
  });

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const data = registerSchema.parse(form);
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      const { data: response } = await apiFetch<{
        token: string;
        user: { id: string; email: string; name: string };
        verification_email_sent?: boolean;
        verification_mail_error?: string | null;
      }>("/api/register", {
        method: "POST",
        body: JSON.stringify({
          name: fullName,
          email: data.email,
          password: data.password,
        }),
      });
      setStoredToken(response.token);
      if (response.verification_email_sent === false) {
        const w = response.verification_mail_error || t("register.mailWarn");
        sessionStorage.setItem("vitalo_register_mail_warn", w);
      } else {
        sessionStorage.removeItem("vitalo_register_mail_warn");
      }
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
        const m = err.message.toLowerCase();
        const msg =
          m.includes("registered") || m.includes("exists")
            ? t("register.err.exists")
            : m.includes("failed to fetch") || m.includes("timed out")
              ? t("register.err.network")
              : err.message;
        setErrors({ _form: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const upd = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as keyof FieldErrors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col px-6 py-10 lg:p-12 order-2 lg:order-1">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground self-start"
        >
          <ArrowLeft className="w-4 h-4" /> {t("register.back")}
        </Link>

        <div className="flex-1 grid place-items-center py-10">
          <div className="w-full max-w-md">
            <h1 className="font-display text-4xl text-ink">{t("register.h1")}</h1>
            <p className="mt-2 text-muted-foreground">
              {t("register.hasAccount")}{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                {t("register.loginLink")}
              </Link>
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
              {errors._form && (
                <div className="p-3 rounded-2xl bg-destructive/10 text-destructive text-sm">
                  {errors._form}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <Field
                  label={t("register.firstName")}
                  value={form.firstName}
                  onChange={(v) => upd("firstName", v)}
                  error={errors.firstName}
                  placeholder={t("register.ph.first")}
                />
                <Field
                  label={t("register.lastName")}
                  value={form.lastName}
                  onChange={(v) => upd("lastName", v)}
                  error={errors.lastName}
                  placeholder={t("register.ph.last")}
                />
              </div>

              <Field
                label={t("register.email")}
                type="email"
                value={form.email}
                onChange={(v) => upd("email", v)}
                error={errors.email}
                placeholder={t("register.ph.email")}
              />

              <Field
                label={t("register.password")}
                type="password"
                value={form.password}
                onChange={(v) => upd("password", v)}
                error={errors.password}
                placeholder={t("register.passwordHint")}
              />

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(e) => upd("acceptTerms", e.target.checked)}
                  className="mt-1 rounded border-border"
                />
                <span>
                  {t("register.acceptBefore")}{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    {t("register.terms")}
                  </Link>{" "}
                  {t("register.and")}{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    {t("register.privacy")}
                  </Link>
                  .
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs text-destructive -mt-2">{errors.acceptTerms}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-all disabled:opacity-70 inline-flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("register.submit")}
              </button>
            </form>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Vitalo
        </p>
      </div>

      <div className="hidden lg:block relative bg-hero overflow-hidden order-1 lg:order-2">
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
              {t("register.sideTitleBefore")}{" "}
              <span className="italic text-primary">{t("register.sideTitleItalic")}</span>
              {t("register.sideTitleAfter")}
            </h2>
            <ul className="mt-8 space-y-3">
              {PERK_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-3 text-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/15 grid place-items-center">
                    <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                  </div>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-12 px-4 rounded-2xl bg-surface border outline-none transition ${
          error
            ? "border-destructive focus:ring-2 focus:ring-destructive/20"
            : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
