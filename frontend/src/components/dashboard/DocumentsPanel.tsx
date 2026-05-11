import { useEffect, useState, useCallback, ChangeEvent } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Image as ImageIcon,
  FileBadge,
  Download,
  Loader2,
  Share2,
} from "lucide-react";
import { z } from "zod";
import { apiFetch, apiUpload, fetchAuthorizedBlob } from "@/lib/api";
import { documentMetaSchema } from "@/auth";
import { SectionCard } from "./DashboardTabs";
import { ShareDialog } from "./ShareDialog";

type DocRow = {
  id: string;
  title: string;
  category: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  note: string | null;
  created_at: string;
};

const CATEGORIES: { value: "lab" | "prescription" | "image" | "report" | "other"; label: string }[] = [
  { value: "lab", label: "Analīzes" },
  { value: "prescription", label: "Recepte" },
  { value: "image", label: "Bilde" },
  { value: "report", label: "Atzinums" },
  { value: "other", label: "Cits" },
];

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function fmtSize(b: number | null) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentsPanel() {
  const [items, setItems] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [sharingDoc, setSharingDoc] = useState<DocRow | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]["value"]>("lab");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const reload = useCallback(async () => {
    const { data } = await apiFetch<DocRow[]>("/api/documents");
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    setFile(f);
    setError(null);
  };

  const upload = async () => {
    setError(null);
    setOkMsg(null);
    if (!file) {
      setError("Izvēlies failu");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Fails ir lielāks par 10 MB");
      return;
    }
    try {
      const meta = documentMetaSchema.parse({
        title: title.trim(),
        category,
        note: note.trim(),
      });

      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", meta.title);
      fd.append("category", meta.category);
      fd.append("note", meta.note ?? "");
      await apiUpload<{ id: string }>("/api/documents", fd);

      setTitle("");
      setNote("");
      setFile(null);
      const inputEl = document.getElementById("doc-file-input") as HTMLInputElement | null;
      if (inputEl) inputEl.value = "";
      setOkMsg("Augšupielādēts!");
      setTimeout(() => setOkMsg(null), 1800);
      reload();
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.issues[0]?.message ?? "Nederīgi dati");
      else if (err instanceof Error) setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const open = async (row: DocRow) => {
    const blob = await fetchAuthorizedBlob(`/api/documents/${row.id}/download`);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const remove = async (row: DocRow) => {
    if (!confirm(`Dzēst "${row.title}"?`)) return;
    await apiFetch(`/api/documents/${row.id}`, { method: "DELETE" });
    reload();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <SectionCard title="Augšupielādēt" icon={Upload}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Fails (līdz 10 MB)
            </label>
            <input
              id="doc-file-input"
              type="file"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFile}
              className="block w-full text-sm text-foreground file:mr-3 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium hover:file:opacity-90"
            />
            {file && (
              <p className="mt-1 text-xs text-muted-foreground">
                {file.name} · {fmtSize(file.size)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Nosaukums
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Asinsanalīzes 2024-04"
              className="w-full h-11 px-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Kategorija
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`h-9 px-3 rounded-full text-xs font-medium border transition ${
                    category === c.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Piezīme
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={400}
              placeholder="Piem. ārsta komentārs"
              className="w-full px-4 py-3 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">{error}</p>
          )}
          {okMsg && (
            <p className="text-sm text-primary bg-primary/10 rounded-xl px-3 py-2">{okMsg}</p>
          )}

          <button
            type="button"
            onClick={upload}
            disabled={uploading}
            className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-all disabled:opacity-70 inline-flex items-center justify-center gap-2"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            Augšupielādēt
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Mani dokumenti" icon={FileText}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Ielādē…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Vēl nav dokumentu.</p>
        ) : (
          <ul className="divide-y divide-border -mx-5">
            {items.map((d) => {
              const isImage = d.mime_type?.startsWith("image/");
              const Icon = isImage ? ImageIcon : FileBadge;
              const cat = CATEGORIES.find((c) => c.value === d.category)?.label ?? d.category;
              return (
                <li key={d.id} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/40">
                  <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cat} · {fmtSize(d.size_bytes)} ·{" "}
                      {new Date(d.created_at).toLocaleDateString("lv-LV")}
                      {d.note && ` · ${d.note}`}
                    </p>
                  </div>
                  <button
                    onClick={() => open(d)}
                    className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                    aria-label="Atvērt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSharingDoc(d)}
                    className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                    aria-label="Dalīties"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(d)}
                    className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                    aria-label="Dzēst"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {sharingDoc && (
        <ShareDialog
          documentId={sharingDoc.id}
          documentTitle={sharingDoc.title}
          onClose={() => setSharingDoc(null)}
        />
      )}
    </div>
  );
}
