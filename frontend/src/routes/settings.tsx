import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { Loader2, Settings } from "lucide-react";
import { z } from "zod";
import { deleteAccountSchema, profileUpdateSchema, useAuth } from "@/auth";
import { apiFetch, ApiUser, setStoredToken } from "@/lib/api";
import { useI18n, usePageTitle } from "@/i18n";
import { PageLayout } from "@/components/marketing/PageLayout";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Iestatījumi — Vitalo" },
      { name: "description", content: "Profila iestatījumi un konta dzēšana." },
    ],
  }),
  component: SettingsPage,
});

type ProfileFieldErrors = Partial<Record<"name" | "_form", string>>;
type DeleteFieldErrors = Partial<Record<"password" | "confirm_email" | "_form", string>>;

function SettingsPage() {
  const { t } = useI18n();
  usePageTitle("settingsPage.title");
  const navigate = useNavigate();
  const { user, loading, refreshProfile } = useAuth();

  const [name, setName] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileOk, setProfileOk] = useState(false);
  const [profileErr, setProfileErr] = useState<ProfileFieldErrors>({});

  const [delPassword, setDelPassword] = useState("");
  const [delEmail, setDelEmail] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState<DeleteFieldErrors>({});

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileErr({});
    setProfileOk(false);
    setProfileBusy(true);
    try {
      const data = profileUpdateSchema.parse({ name });
      await apiFetch<{ user: ApiUser }>("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ name: data.name }),
      });
      await refreshProfile();
      setProfileOk(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fe: ProfileFieldErrors = {};
        for (const issue of err.issues) {
          const k = issue.path[0] as keyof ProfileFieldErrors;
          if (k && !fe[k]) fe[k] = issue.message;
        }
        setProfileErr(fe);
      } else if (err instanceof Error) {
        setProfileErr({ _form: err.message });
      }
    } finally {
      setProfileBusy(false);
    }
  };

  const deleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    setDelErr({});
    const parsed = deleteAccountSchema.safeParse({
      password: delPassword,
      confirm_email: delEmail,
    });
    if (!parsed.success) {
      const fe: DeleteFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof DeleteFieldErrors;
        if (k && !fe[k]) fe[k] = issue.message;
      }
      setDelErr(fe);
      return;
    }

    if (!user) return;
    if (parsed.data.confirm_email !== user.email.toLowerCase()) {
      setDelErr({ confirm_email: t("settingsPage.danger.emailMismatch") });
      return;
    }

    if (!window.confirm(`${t("settingsPage.danger.confirmTitle")}\n\n${t("settingsPage.danger.confirmBody")}`)) {
      return;
    }

    setDelBusy(true);
    try {
      await apiFetch<{ message: string }>("/api/account", {
        method: "DELETE",
        body: JSON.stringify({
          password: parsed.data.password,
          confirm_email: parsed.data.confirm_email,
        }),
      });
      setStoredToken(null);
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const lower = msg.toLowerCase();
      if (lower.includes("nepareiza") || lower.includes("password")) {
        setDelErr({ password: t("settingsPage.danger.wrongPassword") });
      } else {
        setDelErr({ _form: msg || t("settingsPage.danger.deleteFailed") });
      }
    } finally {
      setDelBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <PageLayout>
        <div className="min-h-[50vh] grid place-items-center text-muted-foreground">{t("dash.loading")}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="bg-hero">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 pt-12 pb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 grid place-items-center text-primary shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Vitalo</span>
              <h1 className="mt-2 font-display text-4xl text-ink leading-tight">{t("settingsPage.title")}</h1>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 lg:px-10 pb-20 space-y-10">
        <section className="rounded-3xl border border-border bg-surface-elevated p-8 shadow-soft">
          <h2 className="font-display text-2xl text-ink">{t("settingsPage.profile.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("settingsPage.profile.desc")}</p>
          <form onSubmit={saveProfile} className="mt-6 space-y-4">
            <div>
              <label htmlFor="settings-name" className="text-sm font-medium text-foreground">
                {t("settingsPage.profile.name")}
              </label>
              <input
                id="settings-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (profileErr.name) setProfileErr((x) => ({ ...x, name: undefined }));
                }}
                className="mt-1.5 w-full h-11 rounded-xl border border-border bg-surface px-4 text-sm"
                autoComplete="name"
              />
              {profileErr.name && <p className="mt-1 text-sm text-destructive">{profileErr.name}</p>}
            </div>
            {profileErr._form && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">{profileErr._form}</p>
            )}
            {profileOk && (
              <p className="text-sm text-primary bg-primary/10 rounded-xl px-3 py-2">{t("settingsPage.profile.saved")}</p>
            )}
            <button
              type="submit"
              disabled={profileBusy}
              className="h-11 px-6 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 disabled:opacity-70"
            >
              {profileBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("settingsPage.profile.save")}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-destructive/40 bg-destructive/5 p-8 shadow-soft">
          <h2 className="font-display text-2xl text-ink">{t("settingsPage.danger.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("settingsPage.danger.desc")}</p>
          <form onSubmit={deleteAccount} className="mt-6 space-y-4">
            <div>
              <label htmlFor="settings-del-pw" className="text-sm font-medium text-foreground">
                {t("settingsPage.danger.password")}
              </label>
              <input
                id="settings-del-pw"
                type="password"
                value={delPassword}
                onChange={(e) => {
                  setDelPassword(e.target.value);
                  if (delErr.password) setDelErr((x) => ({ ...x, password: undefined }));
                }}
                className="mt-1.5 w-full h-11 rounded-xl border border-border bg-surface px-4 text-sm"
                autoComplete="current-password"
              />
              {delErr.password && <p className="mt-1 text-sm text-destructive">{delErr.password}</p>}
            </div>
            <div>
              <label htmlFor="settings-del-email" className="text-sm font-medium text-foreground">
                {t("settingsPage.danger.confirmEmail")}
              </label>
              <p className="text-xs text-muted-foreground mt-1">{t("settingsPage.danger.confirmEmailHint")}</p>
              <input
                id="settings-del-email"
                type="email"
                value={delEmail}
                onChange={(e) => {
                  setDelEmail(e.target.value);
                  if (delErr.confirm_email) setDelErr((x) => ({ ...x, confirm_email: undefined }));
                }}
                className="mt-1.5 w-full h-11 rounded-xl border border-border bg-surface px-4 text-sm"
                autoComplete="email"
              />
              {delErr.confirm_email && <p className="mt-1 text-sm text-destructive">{delErr.confirm_email}</p>}
            </div>
            {delErr._form && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">{delErr._form}</p>
            )}
            <button
              type="submit"
              disabled={delBusy}
              className="h-11 px-6 rounded-full border border-destructive bg-destructive text-destructive-foreground text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 disabled:opacity-70"
            >
              {delBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("settingsPage.danger.delete")}
            </button>
          </form>
        </section>
      </div>
    </PageLayout>
  );
}
