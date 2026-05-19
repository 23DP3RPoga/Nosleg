import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Activity,
  MessageCircle,
  Loader2,
  Send,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/share/$token")({
  head: () => ({
    meta: [
      { title: "Koplietots dokuments — Vitalo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SharePage,
});

type SharedDoc = {
  document_id: string;
  title: string;
  category: string;
  note: string | null;
  mime_type: string | null;
  file_path: string;
  shared_note: string | null;
  expires_at: string;
};

type ShareComment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

const AUTHOR_STORAGE_KEY = "vitalo_share_author_name";

function SharePage() {
  const { token } = Route.useParams();
  const { t } = useI18n();
  const [doc, setDoc] = useState<SharedDoc | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [comments, setComments] = useState<ShareComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentErr, setCommentErr] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/public/share/${token}/comments`);
    if (!res.ok) return;
    const json = (await res.json()) as ShareComment[];
    setComments(json);
  }, [token]);

  useEffect(() => {
    const saved = localStorage.getItem(AUTHOR_STORAGE_KEY);
    if (saved) setAuthorName(saved);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/share/${token}`);
        const json = (await res.json()) as SharedDoc & { download_url?: string; error?: string };
        if (!res.ok) {
          setError(json.error ?? t("share.invalidDefault"));
          return;
        }
        setDoc({
          document_id: json.document_id,
          title: json.title,
          category: json.category,
          note: json.note,
          mime_type: json.mime_type,
          file_path: json.file_path,
          shared_note: json.shared_note,
          expires_at: json.expires_at,
        });
        if (json.download_url) setSignedUrl(json.download_url);
        await loadComments();
      } catch (e) {
        setError(e instanceof Error ? e.message : t("share.loadErr"));
      } finally {
        setLoading(false);
      }
    })();
  }, [token, loadComments, t]);

  const submitComment = async (e: FormEvent) => {
    e.preventDefault();
    setCommentErr(null);
    const name = authorName.trim();
    const body = commentBody.trim();
    if (!name || !body) return;

    setCommentBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/share/${token}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ author_name: name, body }),
      });
      const json = (await res.json()) as ShareComment & { error?: string; message?: string };
      if (!res.ok) {
        setCommentErr(json.message ?? json.error ?? t("share.comments.err"));
        return;
      }
      setComments((prev) => [...prev, json]);
      setCommentBody("");
      localStorage.setItem(AUTHOR_STORAGE_KEY, name);
    } catch (e) {
      setCommentErr(e instanceof Error ? e.message : t("share.comments.err"));
    } finally {
      setCommentBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface-elevated">
        <div className="mx-auto max-w-3xl px-6 h-16 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary grid place-items-center shadow-soft">
              <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl tracking-tight text-ink">
              Vitalo<span className="text-primary">.</span>
            </span>
          </Link>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> {t("share.badge")}
          </span>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-10">
        {loading ? (
          <div className="rounded-3xl border border-border bg-surface-elevated p-12 text-center text-muted-foreground">
            {t("share.loading")}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-12 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-destructive mb-4" />
            <h1 className="font-display text-3xl text-ink">{t("share.invalidTitle")}</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium"
            >
              {t("share.home")}
            </Link>
          </div>
        ) : doc ? (
          <article className="rounded-3xl border border-border bg-surface-elevated shadow-soft overflow-hidden">
            <header className="p-8 border-b border-border">
              <span className="text-xs uppercase tracking-[0.18em] text-primary font-medium">
                {categoryLabel(doc.category)}
              </span>
              <h1 className="mt-3 font-display text-4xl text-ink leading-tight">{doc.title}</h1>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {t("share.validUntil")}{" "}
                {new Date(doc.expires_at).toLocaleString("lv-LV", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </header>

            {doc.shared_note && (
              <div className="mx-8 mt-6 rounded-2xl bg-primary/5 border-l-4 border-primary p-4">
                <p className="text-xs uppercase tracking-wider text-primary font-medium mb-1">
                  {t("share.senderNote")}
                </p>
                <p className="text-sm text-foreground italic">{doc.shared_note}</p>
              </div>
            )}

            <div className="p-8">
              {signedUrl && doc.mime_type?.startsWith("image/") ? (
                <img
                  src={signedUrl}
                  alt={doc.title}
                  className="w-full rounded-2xl border border-border"
                />
              ) : signedUrl && doc.mime_type === "application/pdf" ? (
                <iframe
                  src={signedUrl}
                  title={doc.title}
                  className="w-full h-[70vh] rounded-2xl border border-border bg-background"
                />
              ) : (
                <div className="rounded-2xl border border-border bg-surface p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 grid place-items-center text-primary mb-4">
                    {doc.mime_type?.startsWith("image/") ? (
                      <ImageIcon className="w-7 h-7" />
                    ) : (
                      <FileText className="w-7 h-7" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{t("share.downloadHint")}</p>
                </div>
              )}

              {signedUrl && (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> {t("share.download")}
                </a>
              )}
            </div>

            <section className="px-8 pb-8 border-t border-border">
              <h2 className="pt-8 font-display text-2xl text-ink flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                {t("share.comments.title")}
              </h2>

              <form onSubmit={submitComment} className="mt-5 space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t("share.comments.author")}
                  </label>
                  <input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={t("share.comments.authorPh")}
                    maxLength={120}
                    required
                    className="w-full h-11 px-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t("share.comments.body")}
                  </label>
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder={t("share.comments.bodyPh")}
                    maxLength={2000}
                    rows={3}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-y"
                  />
                </div>
                {commentErr && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                    {commentErr}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={commentBusy || !authorName.trim() || !commentBody.trim()}
                  className="h-11 px-6 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {commentBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {t("share.comments.submit")}
                </button>
              </form>

              <div className="mt-8 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {t("share.comments.empty")}
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-border bg-surface p-4"
                    >
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <p className="font-medium text-ink text-sm">{c.author_name}</p>
                        <time className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleString("lv-LV", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </time>
                      </div>
                      <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{c.body}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <footer className="px-8 py-5 border-t border-border bg-surface text-xs text-muted-foreground text-center">
              {t("share.footer")}
            </footer>
          </article>
        ) : null}
      </main>
    </div>
  );
}

function categoryLabel(c: string) {
  const map: Record<string, string> = {
    lab: "Analīzes",
    prescription: "Recepte",
    image: "Bilde",
    report: "Atzinums",
    other: "Dokuments",
  };
  return map[c] ?? "Dokuments";
}
