import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/marketing/PageLayout";
import { Mail, MapPin, MessageCircle, Send, Loader2 } from "lucide-react";
import { useState, useEffect, FormEvent, useMemo } from "react";
import { API_BASE_URL, apiFetch } from "@/lib/api";
import { useI18n, usePageTitle } from "@/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Kontakti — Vitalo" },
      {
        name: "description",
        content:
          "Sazinies ar Vitalo komandu — atbildam uz jautājumiem un priekšlikumiem 24 stundu laikā.",
      },
      { property: "og:title", content: "Kontakti — Vitalo" },
      { property: "og:description", content: "Sazinies ar mums." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();
  usePageTitle("contact.hero.eyebrow");

  const [supportEmail, setSupportEmail] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateForm = (patch: Partial<typeof form>) => {
    setSent(false);
    setForm((f) => ({ ...f, ...patch }));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/site/contact`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { support_email?: string };
        if (!cancelled && data.support_email) setSupportEmail(data.support_email);
      } catch {
        /* keep fallbacks */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const channels = useMemo(
    () => [
      {
        icon: Mail,
        title: t("contact.channel.email"),
        value: supportEmail ?? t("contact.loadingEmail"),
        href: supportEmail ? `mailto:${supportEmail}` : undefined,
      },
      {
        icon: MessageCircle,
        title: t("contact.channel.support"),
        value: supportEmail
          ? `${t("contact.supportInboxHint")} ${supportEmail}`
          : t("contact.channel.supportFallback"),
        href: supportEmail ? `mailto:${supportEmail}` : undefined,
      },
      { icon: MapPin, title: t("contact.channel.office"), value: t("contact.channel.officeAddr") },
    ],
    [supportEmail, t],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch<{ message: string }>(
        "/api/contact",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            subject: form.subject.trim(),
            message: form.message.trim(),
          }),
        },
        null,
      );
      setSent(true);
      setForm((f) => ({ ...f, subject: "", message: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("contact.failGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <PageHero
        eyebrow={t("contact.hero.eyebrow")}
        title={
          <>
            {t("contact.hero.titleBefore")}{" "}
            <span className="italic text-primary">{t("contact.hero.titleItalic")}</span>
            {t("contact.hero.titleAfter")}
          </>
        }
        subtitle={t("contact.hero.subtitle")}
      />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {channels.map((c) => {
              const Inner = (
                <div className="p-6 rounded-3xl bg-surface-elevated border border-border hover:border-primary/40 transition-all flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 grid place-items-center flex-shrink-0">
                    <c.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {c.title}
                    </p>
                    <p className="mt-1 font-medium text-foreground break-words">{c.value}</p>
                  </div>
                </div>
              );
              return c.href ? (
                <a key={c.title} href={c.href} className="block">
                  {Inner}
                </a>
              ) : (
                <div key={c.title}>{Inner}</div>
              );
            })}
          </div>

          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="p-8 lg:p-10 rounded-3xl bg-surface-elevated border border-border shadow-soft space-y-5"
            >
              <h2 className="font-display text-2xl text-ink">{t("contact.formTitle")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("contact.formIntroBefore")}
                <code className="text-xs bg-muted px-1 rounded">MAIL_FROM_ADDRESS</code>
                {t("contact.formIntroAfter")}
              </p>

              {error && (
                <div className="p-3 rounded-2xl bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              {sent && (
                <div className="p-3 rounded-2xl bg-primary/10 text-primary text-sm">
                  {t("contact.success")}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label={t("contact.field.name")}
                  value={form.name}
                  onChange={(v) => updateForm({ name: v })}
                  placeholder={t("contact.ph.name")}
                  disabled={submitting}
                />
                <Field
                  label={t("contact.field.email")}
                  type="email"
                  value={form.email}
                  onChange={(v) => updateForm({ email: v })}
                  placeholder={t("contact.ph.email")}
                  disabled={submitting}
                />
              </div>
              <Field
                label={t("contact.field.subject")}
                value={form.subject}
                onChange={(v) => updateForm({ subject: v })}
                placeholder={t("contact.ph.subject")}
                disabled={submitting}
              />

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {t("contact.field.message")}
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => updateForm({ message: e.target.value })}
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none disabled:opacity-60"
                  placeholder={t("contact.ph.message")}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? t("contact.submitting") : t("contact.submit")}
                {!submitting && <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-12 px-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-60"
      />
    </div>
  );
}
