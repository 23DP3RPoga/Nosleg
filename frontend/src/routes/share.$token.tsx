import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

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

function SharePage() {
  const { token } = Route.useParams();
  const [doc, setDoc] = useState<SharedDoc | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/share/${token}`);
        const json = (await res.json()) as SharedDoc & { download_url?: string; error?: string };
        if (!res.ok) {
          setError(json.error ?? "Saite nav derīga vai ir beidzies derīguma termiņš.");
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
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kļūda ielādējot dokumentu");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

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
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Drošs koplietojums
          </span>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-10">
        {loading ? (
          <div className="rounded-3xl border border-border bg-surface-elevated p-12 text-center text-muted-foreground">
            Ielādē dokumentu…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-12 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-destructive mb-4" />
            <h1 className="font-display text-3xl text-ink">Saite nav derīga</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium"
            >
              Doties uz Vitalo
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
                Derīgs līdz{" "}
                {new Date(doc.expires_at).toLocaleString("lv-LV", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </header>

            {doc.shared_note && (
              <div className="mx-8 mt-6 rounded-2xl bg-primary/5 border-l-4 border-primary p-4">
                <p className="text-xs uppercase tracking-wider text-primary font-medium mb-1">
                  Piezīme no sūtītāja
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
                  <p className="text-sm text-muted-foreground">
                    Lejupielādē failu, lai apskatītu.
                  </p>
                </div>
              )}

              {signedUrl && (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Lejupielādēt
                </a>
              )}
            </div>

            <footer className="px-8 py-5 border-t border-border bg-surface text-xs text-muted-foreground text-center">
              Šis dokuments ir koplietots privāti. Saite tiks automātiski deaktivizēta pēc derīguma termiņa.
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
