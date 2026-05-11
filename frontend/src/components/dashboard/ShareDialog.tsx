import { useState, FormEvent } from "react";
import { X, Copy, Check, Mail, Link2, Loader2, Clock } from "lucide-react";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { shareSchema } from "@/auth";
import { useI18n } from "@/i18n";

function durationToken(hours: number, t: (key: string) => string) {
  if (hours === 1) return t("shareDlg.valid1h");
  if (hours === 24) return t("shareDlg.valid24h");
  if (hours === 72) return t("shareDlg.valid3d");
  return t("shareDlg.valid7d");
}

function expiryBadge(hours: number, t: (key: string) => string) {
  if (hours === 1) return t("shareDlg.badge1h");
  if (hours === 24) return t("shareDlg.badge24h");
  if (hours === 72) return t("shareDlg.badge3d");
  return t("shareDlg.badge7d");
}

function expiryOptionLabel(hours: number, t: (key: string) => string) {
  if (hours === 1) return t("shareDlg.opt1h");
  if (hours === 24) return t("shareDlg.opt24h");
  if (hours === 72) return t("shareDlg.opt3d");
  return t("shareDlg.opt7d");
}

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

export function ShareDialog({ documentId, documentTitle, onClose }: Props) {
  const { t } = useI18n();
  const [hours, setHours] = useState<number>(24);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientNote, setRecipientNote] = useState("");
  const [generating, setGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

      await apiFetch("/api/shares", {
        method: "POST",
        body: JSON.stringify({
          document_id: Number(documentId),
          token,
          recipient_email: valid.recipient_email || null,
          recipient_note: valid.recipient_note || null,
          expires_at: expires,
        }),
      });

      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.issues[0]?.message ?? t("shareDlg.invalidData"));
      else if (err instanceof Error) setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmail = async () => {
    if (!shareUrl || !recipientEmail) return;
    setEmailSending(true);
    setError(null);
    try {
      // Open user's default mail client with prefilled message
      const subject = encodeURIComponent(`Vitalo: ${documentTitle}`);
      const dur = durationToken(hours, t);
      const bodyParts = [
        t("shareDlg.mailGreeting"),
        ``,
        t("shareDlg.mailIntro").replace("{{title}}", documentTitle),
        ``,
        recipientNote ? t("shareDlg.mailNoteLine").replace("{{note}}", recipientNote) : "",
        t("shareDlg.mailViewLine").replace("{{duration}}", dur),
        shareUrl,
        ``,
        t("shareDlg.mailFooter"),
      ].filter(Boolean);
      const body = encodeURIComponent(bodyParts.join("\n"));
      window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
      setEmailSent(true);
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
        className="relative w-full max-w-md rounded-3xl bg-surface-elevated border border-border shadow-elevated overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-5 border-b border-border flex items-center gap-3">
          <Link2 className="w-5 h-5 text-primary" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-2xl text-ink">{t("shareDlg.heading")}</h3>
            <p className="text-xs text-muted-foreground truncate">{documentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-6 space-y-4">
          {!shareUrl ? (
            <form onSubmit={generate} className="space-y-4">
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
                <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={generating}
                className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-all disabled:opacity-70 inline-flex items-center justify-center gap-2"
              >
                {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("shareDlg.generateBtn")}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-wider text-primary font-medium mb-2 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {expiryBadge(hours, t)}
                </p>
                <p className="text-xs text-foreground break-all font-mono">{shareUrl}</p>
              </div>

              <button
                onClick={copyLink}
                className="w-full h-11 rounded-full border border-border bg-surface hover:bg-muted transition inline-flex items-center justify-center gap-2 text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                {copied ? t("shareDlg.copied") : t("shareDlg.copy")}
              </button>

              {recipientEmail && !emailSent && (
                <button
                  onClick={sendEmail}
                  disabled={emailSending}
                  className="w-full h-11 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {t("shareDlg.openMailPrefix")} {recipientEmail}
                </button>
              )}

              {emailSent && (
                <p className="text-sm text-primary bg-primary/10 rounded-xl px-3 py-2 text-center">
                  {t("shareDlg.mailOpened")}
                </p>
              )}

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                onClick={onClose}
                className="w-full h-10 text-sm text-muted-foreground hover:text-foreground transition"
              >
                {t("shareDlg.close")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
