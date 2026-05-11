import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  HeartPulse,
  FileText,
  CalendarClock,
  Pill,
  Stethoscope,
  Watch,
  LogOut,
  Mail,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/auth";
import { useI18n, usePageTitle } from "@/i18n";
import { PageLayout } from "@/components/marketing/PageLayout";
import { DashboardTabs, type TabKey } from "@/components/dashboard/DashboardTabs";
import { MeasurementsPanel } from "@/components/dashboard/MeasurementsPanel";
import { DocumentsPanel } from "@/components/dashboard/DocumentsPanel";
import { AppointmentsPanel } from "@/components/dashboard/AppointmentsPanel";
import { MedicationsPanel } from "@/components/dashboard/MedicationsPanel";
import { DoctorsPanel } from "@/components/dashboard/DoctorsPanel";
import { DevicesPanel } from "@/components/dashboard/DevicesPanel";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Mans pārskats — Vitalo" },
      {
        name: "description",
        content:
          "Reģistrē veselības rādītājus, glabā medicīniskos dokumentus, plāno ārstu vizītes un zāļu atgādinājumus.",
      },
    ],
  }),
  component: DashboardPage,
});

type Counts = {
  measurements: number;
  documents: number;
  appointments: number;
  medications: number;
  doctors: number;
};

function DashboardPage() {
  const { t } = useI18n();
  usePageTitle("dash.metaTitle");
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("overview");
  const [counts, setCounts] = useState<Counts>({
    measurements: 0,
    documents: 0,
    appointments: 0,
    medications: 0,
    doctors: 0,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user?.email_verified_at) return;
    (async () => {
      try {
        const { data } = await apiFetch<Counts>("/api/dashboard/counts");
        setCounts(data);
      } catch {
        /* e.g. session expired */
      }
    })();
  }, [user?.email_verified_at, tab]);

  if (loading || !user) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
          {t("dash.loading")}
        </div>
      </PageLayout>
    );
  }

  const firstName = profile?.first_name || user.email?.split("@")[0] || t("common.user");

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (!user.email_verified_at) {
    return (
      <PageLayout>
        <section className="bg-hero">
          <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-12 pb-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                  {t("dash.verifyEyebrow")}
                </span>
                <h1 className="mt-3 font-display text-5xl text-ink leading-[1.05]">
                  {t("dash.greeting")} <span className="italic text-primary">{firstName}</span>.
                </h1>
                <p className="mt-3 text-muted-foreground max-w-xl">
                  {t("dash.verifyIntro")}{" "}
                  <Link to="/forgot-password" className="text-primary font-medium hover:underline">
                    {t("dash.forgotLink")}
                  </Link>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="h-11 inline-flex items-center gap-2 px-5 rounded-full text-sm font-medium border border-border bg-surface-elevated hover:bg-muted transition"
              >
                <LogOut className="w-4 h-4" /> {t("dash.signOut")}
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-6 lg:px-10 py-10 pb-20">
          <VerifyEmailPanel email={user.email} onRecheck={refreshProfile} />
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-12 pb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                {t("dash.mainEyebrow")}
              </span>
              <h1 className="mt-3 font-display text-5xl text-ink leading-[1.05]">
                {t("dash.greeting")} <span className="italic text-primary">{firstName}</span>.
              </h1>
              <p className="mt-3 text-muted-foreground max-w-xl">{t("dash.mainSub")}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="h-11 inline-flex items-center gap-2 px-5 rounded-full text-sm font-medium border border-border bg-surface-elevated hover:bg-muted transition"
            >
              <LogOut className="w-4 h-4" /> {t("dash.signOut")}
            </button>
          </div>
        </div>
      </section>

      <DashboardTabs active={tab} onChange={setTab} />

      <section className="mx-auto max-w-6xl px-4 lg:px-10 py-8 pb-20">
        {tab === "overview" && <OverviewPanel counts={counts} onJump={setTab} />}
        {tab === "measurements" && <MeasurementsPanel />}
        {tab === "documents" && <DocumentsPanel />}
        {tab === "appointments" && <AppointmentsPanel />}
        {tab === "medications" && <MedicationsPanel />}
        {tab === "doctors" && <DoctorsPanel />}
        {tab === "devices" && <DevicesPanel />}
      </section>
    </PageLayout>
  );
}

function VerifyEmailPanel({ email, onRecheck }: { email: string; onRecheck: () => Promise<void> }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState<"resend" | "check" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const w = sessionStorage.getItem("vitalo_register_mail_warn");
    if (w) {
      setErr(w);
      sessionStorage.removeItem("vitalo_register_mail_warn");
    }
  }, []);

  const resend = async () => {
    setErr(null);
    setMsg(null);
    setBusy("resend");
    try {
      const { data } = await apiFetch<{ message: string }>("/api/email/verification-notification", {
        method: "POST",
      });
      setMsg(data.message);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("dash.verify.errSend"));
    } finally {
      setBusy(null);
    }
  };

  const recheck = async () => {
    setErr(null);
    setMsg(null);
    setBusy("check");
    try {
      await onRecheck();
    } catch {
      setErr(t("dash.verify.errProfile"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 grid place-items-center text-primary shrink-0">
          <Mail className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <h2 className="font-display text-2xl text-ink">{t("dash.verify.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {(() => {
              const parts = t("dash.verify.p1").split("{{email}}");
              return (
                <>
                  {parts[0]}
                  <span className="font-medium text-foreground">{email}</span>
                  {parts[1] ?? ""}{" "}
                  {t("dash.verify.p2")}{" "}
                  <code className="text-xs bg-muted px-1 rounded">.env</code>:{" "}
                  <code className="text-xs bg-muted px-1 rounded">MAIL_FROM_ADDRESS</code>,{" "}
                  <code className="text-xs bg-muted px-1 rounded">MAIL_MAILER</code>,{" "}
                  <code className="text-xs bg-muted px-1 rounded">APP_URL</code>,{" "}
                  <code className="text-xs bg-muted px-1 rounded">FRONTEND_URL</code>.
                </>
              );
            })()}
          </p>
          {msg && <p className="text-sm text-primary bg-primary/10 rounded-xl px-3 py-2">{msg}</p>}
          {err && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">{err}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={resend}
              disabled={busy !== null}
              className="h-11 px-5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 disabled:opacity-70"
            >
              {busy === "resend" && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("dash.verify.resend")}
            </button>
            <button
              type="button"
              onClick={recheck}
              disabled={busy !== null}
              className="h-11 px-5 rounded-full border border-border bg-surface text-sm font-medium inline-flex items-center gap-2 disabled:opacity-70"
            >
              {busy === "check" && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("dash.verify.recheck")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewPanel({ counts, onJump }: { counts: Counts; onJump: (k: TabKey) => void }) {
  const { t } = useI18n();
  const cards: {
    key: TabKey;
    label: string;
    count: number;
    icon: typeof Activity;
    desc: string;
  }[] = [
    {
      key: "measurements",
      label: t("dash.ov.mea"),
      count: counts.measurements,
      icon: HeartPulse,
      desc: t("dash.ov.meaD"),
    },
    {
      key: "documents",
      label: t("dash.ov.doc"),
      count: counts.documents,
      icon: FileText,
      desc: t("dash.ov.docD"),
    },
    {
      key: "appointments",
      label: t("dash.ov.appt"),
      count: counts.appointments,
      icon: CalendarClock,
      desc: t("dash.ov.apptD"),
    },
    {
      key: "medications",
      label: t("dash.ov.med"),
      count: counts.medications,
      icon: Pill,
      desc: t("dash.ov.medD"),
    },
    {
      key: "doctors",
      label: t("dash.ov.dr"),
      count: counts.doctors,
      icon: Stethoscope,
      desc: t("dash.ov.drD"),
    },
    {
      key: "devices",
      label: t("dash.ov.dev"),
      count: 0,
      icon: Watch,
      desc: t("dash.ov.devD"),
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button
            type="button"
            key={c.key}
            onClick={() => onJump(c.key)}
            className="text-left rounded-3xl bg-surface-elevated border border-border p-6 shadow-soft hover:shadow-elevated hover:border-primary/40 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-soft">
              <Icon className="w-5 h-5" strokeWidth={2.4} />
            </div>
            <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-4xl text-ink">
              {c.key === "devices" ? "—" : c.count}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
