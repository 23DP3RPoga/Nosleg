import { useEffect, useState, useCallback, FormEvent } from "react";
import {
  Search,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Star,
  Plus,
  Heart,
  Trash2,
  Building2,
  Globe,
} from "lucide-react";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { userDoctorSchema } from "@/auth";
import { SectionCard } from "./DashboardTabs";

type CatalogDoctor = {
  id: string;
  full_name: string;
  specialty: string;
  city: string | null;
  clinic: string | null;
  phone: string | null;
  email: string | null;
  languages: string[] | null;
  rating: number | null;
  bio: string | null;
  accepting_patients: boolean;
};

type SavedDoctor = {
  id: string;
  doctor_id: string | null;
  full_name: string;
  specialty: string | null;
  clinic: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  source: string;
};

export function DoctorsPanel() {
  const [view, setView] = useState<"catalog" | "mine">("catalog");
  const [catalog, setCatalog] = useState<CatalogDoctor[]>([]);
  const [saved, setSaved] = useState<SavedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState<string>("");
  const [specialtyOptions, setSpecialtyOptions] = useState<string[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await apiFetch<string[]>("/api/doctors/specialties");
      setSpecialtyOptions(data);
    })();
  }, []);

  const reloadCatalog = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (search.trim()) params.set("search", search.trim());
    const qs = params.toString();
    const { data } = await apiFetch<CatalogDoctor[]>(
      `/api/doctors/catalog${qs ? `?${qs}` : ""}`
    );
    setCatalog(data);
    setLoading(false);
  }, [search, specialty]);

  const reloadSaved = useCallback(async () => {
    const { data } = await apiFetch<SavedDoctor[]>("/api/doctors/saved");
    setSaved(data);
  }, []);

  useEffect(() => {
    reloadCatalog();
    reloadSaved();
  }, [reloadCatalog, reloadSaved]);

  const saveFromCatalog = async (d: CatalogDoctor) => {
    if (saved.some((s) => s.doctor_id === d.id)) return;
    await apiFetch("/api/doctors/saved", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: d.id,
        full_name: d.full_name,
        specialty: d.specialty,
        clinic: d.clinic,
        phone: d.phone,
        email: d.email,
        source: "catalog",
      }),
    });
    reloadSaved();
  };

  const removeSaved = async (id: string) => {
    if (!confirm("Noņemt no saraksta?")) return;
    await apiFetch(`/api/doctors/saved/${id}`, { method: "DELETE" });
    reloadSaved();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-surface-elevated rounded-full p-1.5 border border-border w-fit">
        <button
          onClick={() => setView("catalog")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${
            view === "catalog"
              ? "bg-gradient-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Atrast ārstu
        </button>
        <button
          onClick={() => setView("mine")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${
            view === "mine"
              ? "bg-gradient-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Mani ārsti ({saved.length})
        </button>
      </div>

      {view === "catalog" ? (
        <>
          <SectionCard title="Meklēt katalogā" icon={Search}>
            <div className="grid gap-3 md:grid-cols-[1fr_240px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Vārds, klīnika, pilsēta…"
                  className="w-full h-11 pl-11 pr-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="h-11 px-4 rounded-2xl bg-surface border border-border focus:border-primary outline-none transition text-sm"
              >
                <option value="">Visas specialitātes</option>
                {specialtyOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </SectionCard>

          {loading ? (
            <p className="text-sm text-muted-foreground">Ielādē…</p>
          ) : catalog.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nav atrasts.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {catalog.map((d) => {
                const isSaved = saved.some((s) => s.doctor_id === d.id);
                return (
                  <article
                    key={d.id}
                    className="rounded-3xl bg-surface-elevated border border-border p-5 shadow-soft hover:shadow-elevated hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-xl text-ink">{d.full_name}</h3>
                        <p className="text-xs uppercase tracking-wider text-primary font-medium">
                          {d.specialty}
                        </p>
                        {d.rating && (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {d.rating.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                      {d.clinic && (
                        <p className="inline-flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5" /> {d.clinic}
                        </p>
                      )}
                      {d.city && (
                        <p className="inline-flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" /> {d.city}
                        </p>
                      )}
                      {d.phone && (
                        <p className="inline-flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" /> {d.phone}
                        </p>
                      )}
                      {d.email && (
                        <p className="inline-flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5" /> {d.email}
                        </p>
                      )}
                      {d.languages && d.languages.length > 0 && (
                        <p className="inline-flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5" /> {d.languages.join(", ").toUpperCase()}
                        </p>
                      )}
                    </div>

                    {d.bio && (
                      <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">
                        {d.bio}
                      </p>
                    )}

                    <button
                      onClick={() => saveFromCatalog(d)}
                      disabled={isSaved}
                      className={`mt-4 w-full h-10 rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 transition ${
                        isSaved
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                      {isSaved ? "Pievienots" : "Saglabāt"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <SectionCard
            title="Pievienot savu ārstu"
            icon={Plus}
            action={
              <button
                onClick={() => setShowCustomForm((v) => !v)}
                className="text-xs text-primary font-medium"
              >
                {showCustomForm ? "Aizvērt" : "Atvērt"}
              </button>
            }
          >
            {showCustomForm ? (
              <CustomDoctorForm
                onSaved={() => {
                  setShowCustomForm(false);
                  reloadSaved();
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Pievieno ārstu, kura nav publiskajā katalogā — piem., savu ģimenes ārstu vai ārvalstu speciālistu.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Mans saraksts" icon={Heart}>
            {saved.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Vēl nav pievienotu ārstu. Atrodi katalogā vai pievieno savu.
              </p>
            ) : (
              <ul className="space-y-3">
                {saved.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-2xl border border-border bg-surface p-4 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{d.full_name}</p>
                      {d.specialty && (
                        <p className="text-xs text-muted-foreground">{d.specialty}</p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {d.clinic && <span>{d.clinic}</span>}
                        {d.phone && <span>{d.phone}</span>}
                        {d.email && <span className="truncate">{d.email}</span>}
                      </div>
                      {d.notes && (
                        <p className="mt-2 text-xs text-muted-foreground italic">{d.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeSaved(d.id)}
                      className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                      aria-label="Dzēst"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function CustomDoctorForm({ onSaved }: { onSaved: () => void }) {
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [clinic, setClinic] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const valid = userDoctorSchema.parse({
        full_name: fullName,
        specialty,
        clinic,
        phone,
        email,
        notes,
      });
      await apiFetch("/api/doctors/saved", {
        method: "POST",
        body: JSON.stringify({
          full_name: valid.full_name,
          specialty: valid.specialty || null,
          clinic: valid.clinic || null,
          phone: valid.phone || null,
          email: valid.email || null,
          notes: valid.notes || null,
          source: "custom",
        }),
      });
      onSaved();
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.issues[0]?.message ?? "Nederīgi dati");
      else if (err instanceof Error) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full h-11 px-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition";
  const lblCls = "block text-xs uppercase tracking-wider text-muted-foreground mb-2";

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className={lblCls}>Vārds *</label>
        <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. Jānis Bērziņš" />
      </div>
      <div>
        <label className={lblCls}>Specializācija</label>
        <input className={inputCls} value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Kardiologs" />
      </div>
      <div>
        <label className={lblCls}>Klīnika</label>
        <input className={inputCls} value={clinic} onChange={(e) => setClinic(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lblCls}>Telefons</label>
          <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className={lblCls}>E-pasts</label>
          <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={lblCls}>Piezīmes</label>
        <textarea
          rows={2}
          maxLength={400}
          className="w-full px-4 py-3 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="w-full h-11 rounded-full bg-gradient-primary text-primary-foreground font-medium disabled:opacity-70"
      >
        Pievienot
      </button>
    </form>
  );
}
