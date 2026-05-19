import { useState, FormEvent, useEffect, useCallback } from "react";
import { X, Copy, Check, Mail, Link2, Loader2, Clock } from "lucide-react";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { shareSchema } from "@/auth";
import { useI18n } from "@/i18n";

function expiryOptionLabel(hours: number, t: (key: string) => string) {
  if (hours === 1) return t("shareDlg.opt1h");
  if (hours === 24) return t("shareDlg.opt24h");
  if (hours === 72) return t("shareDlg.opt3d");
  return t("shareDlg.opt7d");
}

type SavedShare = {
  id: string;
  token: string;
  recipient_email: string | null;
  recipient_note: string | null;
  expires_at: string;
  is_active: boolean;
  created_at: string;
};

type Props = {
  documentId: string;
  documentTitle: string;
  onClose: () => void;
};

function generateToken() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 32);
}

function shareUrlFor(token: string) {
  return `${window.location.origin}/share/${token}`;
}

export function ShareDialog({ documentId, documentTitle, onClose }: Props) {
  const { t } = useI18n();
  const [hours, setHours] = useState<number>(24);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientNote, setRecipientNote] = useState("");
  const [generating, setGenerating] = useState(false);
  const [savedShares, setSavedShares] = useState<SavedShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentFor, setEmailSentFor] = useState<string | null>(null);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const loadShares = useCallback(async () => {
    setLoadingShares(true);
    try {
      const { data } = await apiFetch<SavedShare[]>(`/api/documents/${documentId}/shares`);
      setSavedShares(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("shareDlg.loadErr"));
    } finally {
      setLoadingShares(false);
    }
  }, [documentId, t]);

  useEffect(() => {
    loadShares();
  }, [loadShares]);

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setGenerating(true);
    try {
      const valid = shareSchema.parse({
        hours,
        recipient_email: recipientEmail,
        recipient_note: recipientNote,
      });
      const token = generateToken();
      const expires = new Date(Date.now() + valid.hours * 60 * 60 * 1000).toISOString();

      const { data } = await apiFetch<{
        id: string;
        token: string;
        expires_at: string;
        is_active: boolean;
      }>("/api/shares", {
        method: "POST",
        body: JSON.stringify({
          document_id: Number(documentId),
          token,
          recipient_email: valid.recipient_email || null,
          recipient_note: valid.recipient_note || null,
          expires_at: expires,
        }),
      });

      setLastCreatedId(data.id);
      setRecipientEmail("");
      setRecipientNote("");
      await loadShares();
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.issues[0]?.message ?? t("shareDlg.invalidData"));
      else if (err instanceof Error) setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async (share: SavedShare) => {
    await navigator.clipboard.writeText(shareUrlFor(share.token));
    setCopiedId(share.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendEmail = async (share: SavedShare) => {
    if (!share.recipient_email) return;
    setEmailSending(true);
    setError(null);
    try {
      const subject = encodeURIComponent(`Vitalo: ${documentTitle}`);
      const dur = new Date(share.expires_at).toLocaleString();
      const bodyParts = [
        t("shareDlg.mailGreeting"),
        ``,
        t("shareDlg.mailIntro").replace("{{title}}", documentTitle),
        ``,
        share.recipient_note ? t("shareDlg.mailNoteLine").replace("{{note}}", share.recipient_note) : "",
        t("shareDlg.mailViewLine").replace("{{duration}}", dur),
        shareUrlFor(share.token),
        ``,
        t("shareDlg.mailFooter"),
      ].filter(Boolean);
      const body = encodeURIComponent(bodyParts.join("\n"));
      window.location.href = `mailto:${share.recipient_email}?subject=${subject}&body=${body}`;
      setEmailSentFor(share.id);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-surface-elevated border border-border shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 px-6 py-5 border-b border-border bg-surface-elevated flex items-center gap-3">
          <Link2 className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-2xl text-ink">{t("shareDlg.heading")}</h3>
            <p className="text-xs text-muted-foreground truncate">{documentTitle}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("shareDlg.savedHint")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:bg-muted transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-6 space-y-5">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
              {t("shareDlg.savedTitle")}
            </h4>
            {loadingShares ? (
              <div className="py-6 grid place-items-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : savedShares.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border px-4 py-5 text-center">
                {t("shareDlg.savedEmpty")}
              </p>
            ) : (
              <ul className="space-y-2">
                {savedShares.map((share) => {
                  const url = shareUrlFor(share.token);
                  const isNew = share.id === lastCreatedId;
                  return (
                    <li
                      key={share.id}
                      className={`rounded-2xl border p-3 space-y-2 ${
                        isNew
                          ? "border-primary/40 bg-primary/5"
                          : share.is_active
                            ? "border-border bg-surface"
                            : "border-border/60 bg-muted/30 opacity-80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-medium inline-flex items-center gap-1 ${
                            share.is_active ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {share.is_active
                            ? t("shareDlg.statusActive")
                            : t("shareDlg.statusExpired")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(share.expires_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground break-all font-mono leading-relaxed">{url}</p>
                      {share.recipient_email && (
                        <p className="text-xs text-muted-foreground truncate">{share.recipient_email}</p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => copyLink(share)}
                          className="h-9 px-3 rounded-full border border-border bg-surface-elevated hover:bg-muted transition inline-flex items-center gap-1.5 text-xs font-medium"
                        >
                          {copiedId === share.id ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedId === share.id ? t("shareDlg.copied") : t("shareDlg.copy")}
                        </button>
                        {share.recipient_email && share.is_active && (
                          <button
                            type="button"
                            onClick={() => sendEmail(share)}
                            disabled={emailSending}
                            className="h-9 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary/15 transition inline-flex items-center gap-1.5 text-xs font-medium disabled:opacity-60"
                          >
                            {emailSending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Mail className="w-3.5 h-3.5" />
                            )}
                            {t("shareDlg.mailto")}
                          </button>
                        )}
                      </div>
                      {emailSentFor === share.id && (
                        <p className="text-xs text-primary">{t("shareDlg.mailOpened")}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <form onSubmit={generate} className="space-y-4 pt-2 border-t border-border">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {t("shareDlg.newLink")}
            </h4>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {t("shareDlg.expiry")}
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 24, 72, 168].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`h-9 px-4 rounded-full text-xs font-medium border transition ${
                      hours === h
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {expiryOptionLabel(h, t)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {t("shareDlg.doctorEmail")}
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder={t("shareDlg.emailPh")}
                className="w-full h-11 px-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {t("shareDlg.noteRecipient")}
              </label>
              <textarea
                rows={2}
                maxLength={300}
                value={recipientNote}
                onChange={(e) => setRecipientNote(e.target.value)}
                placeholder={t("shareDlg.notePh")}
                className="w-full px-4 py-3 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={generating}
              className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-all disabled:opacity-70 inline-flex items-center justify-center gap-2"
            >
              {generating && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("shareDlg.generateBtn")}
            </button>
            <p className="text-xs text-muted-foreground text-center">{t("shareDlg.urlHelp")}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
