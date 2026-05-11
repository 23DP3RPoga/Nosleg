import { useEffect, useState, FormEvent, useCallback } from "react";
import {
  Activity,
  Heart,
  Droplets,
  Scale,
  Plus,
  Trash2,
  HeartPulse,
  Download,
} from "lucide-react";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { measurementInputSchema, useAuth, type MeasurementType } from "@/auth";
import { exportMeasurementsPDF } from "@/lib/pdf-export";
import { SectionCard } from "./DashboardTabs";
import { MeasurementChart } from "./MeasurementChart";

type Row = {
  id: string;
  type: MeasurementType;
  systolic: number | null;
  diastolic: number | null;
  value: number | null;
  note: string | null;
  taken_at: string;
};

const META: Record<MeasurementType, { label: string; unit: string; icon: typeof Activity; color: string }> = {
  bp: { label: "Asinsspiediens", unit: "mmHg", icon: Activity, color: "text-primary" },
  heart: { label: "Sirds ritms", unit: "sit/min", icon: Heart, color: "text-destructive" },
  glucose: { label: "Glikoze", unit: "mmol/L", icon: Droplets, color: "text-warm-foreground" },
  weight: { label: "Svars", unit: "kg", icon: Scale, color: "text-accent-foreground" },
};

export function MeasurementsPanel() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<MeasurementType>("bp");

  const reload = useCallback(async () => {
    const { data } = await apiFetch<Row[]>("/api/measurements");
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const last = (t: MeasurementType) => items.find((i) => i.type === t);

  const handleExport = () => {
    const fullName =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      undefined;
    exportMeasurementsPDF({ rows: items, patientName: fullName });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Pēdējie {items.length} mērījumi
        </p>
        <button
          onClick={handleExport}
          disabled={items.length === 0}
          className="h-11 inline-flex items-center gap-2 px-5 rounded-full text-sm font-medium border border-border bg-surface-elevated hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Eksportēt PDF
        </button>
      </div>

    <div className="grid gap-6 lg:grid-cols-4">
      {(Object.keys(META) as MeasurementType[]).map((t) => {
        const meta = META[t];
        const l = last(t);
        const Icon = meta.icon;
        return (
          <div
            key={t}
            className="rounded-3xl bg-surface-elevated border border-border p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-2xl bg-muted grid place-items-center ${meta.color}`}>
                <Icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {meta.unit}
              </span>
            </div>
            <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
              {meta.label}
            </p>
            <p className="mt-1 font-display text-3xl text-ink">
              {l
                ? t === "bp"
                  ? `${l.systolic ?? "—"}/${l.diastolic ?? "—"}`
                  : (l.value ?? "—")
                : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {l
                ? new Date(l.taken_at).toLocaleDateString("lv-LV", {
                    day: "numeric",
                    month: "short",
                  })
                : "Nav datu"}
            </p>
          </div>
        );
      })}

      <div className="lg:col-span-2">
        <AddMeasurementForm onAdded={reload} />
      </div>

      <div className="lg:col-span-2">
        <SectionCard title="Vēsture" icon={HeartPulse}>
          {loading ? (
            <p className="text-sm text-muted-foreground">Ielādē…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Vēl nav mērījumu.</p>
          ) : (
            <ul className="divide-y divide-border max-h-[420px] overflow-y-auto -mx-5">
              {items.map((m) => {
                const meta = META[m.type];
                const Icon = meta.icon;
                return (
                  <li key={m.id} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/40">
                    <div className={`w-9 h-9 rounded-xl bg-muted grid place-items-center ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {meta.label}:{" "}
                        <span className="font-display text-lg text-ink">
                          {m.type === "bp"
                            ? `${m.systolic}/${m.diastolic}`
                            : m.value}
                        </span>{" "}
                        <span className="text-xs text-muted-foreground">{meta.unit}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.taken_at).toLocaleString("lv-LV")}
                        {m.note && <> · {m.note}</>}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await apiFetch(`/api/measurements/${m.id}`, { method: "DELETE" });
                        reload();
                      }}
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
      </div>

      <div className="lg:col-span-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(META) as MeasurementType[]).map((t) => {
            const m = META[t];
            const Icon = m.icon;
            const active = chartType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setChartType(t)}
                className={`h-10 px-4 rounded-full border text-sm font-medium inline-flex items-center gap-2 transition ${
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? m.color : ""}`} />
                {m.label}
              </button>
            );
          })}
        </div>
        <MeasurementChart rows={items} type={chartType} />
      </div>
    </div>
    </div>
  );
}

function AddMeasurementForm({ onAdded }: { onAdded: () => void }) {
  const [type, setType] = useState<MeasurementType>("bp");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setSystolic("");
    setDiastolic("");
    setValue("");
    setNote("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    setSubmitting(true);
    try {
      const payload = {
        type,
        taken_at: new Date().toISOString(),
        note: note.trim() || undefined,
        ...(type === "bp"
          ? { systolic: Number(systolic), diastolic: Number(diastolic) }
          : { value: Number(value) }),
      };
      const valid = measurementInputSchema.parse(payload);
      await apiFetch("/api/measurements", {
        method: "POST",
        body: JSON.stringify(valid),
      });
      onAdded();
      reset();
      setOkMsg("Saglabāts!");
      setTimeout(() => setOkMsg(null), 1800);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message ?? "Nederīga vērtība");
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard title="Pievienot mērījumu" icon={Plus}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Tips
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(META) as MeasurementType[]).map((t) => {
              const m = META[t];
              const Icon = m.icon;
              const active = t === type;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setError(null);
                  }}
                  className={`h-11 px-3 rounded-2xl border text-sm font-medium inline-flex items-center gap-2 transition ${
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? m.color : ""}`} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {type === "bp" ? (
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Sistoliskais" value={systolic} onChange={setSystolic} placeholder="120" />
            <NumberField label="Diastoliskais" value={diastolic} onChange={setDiastolic} placeholder="80" />
          </div>
        ) : (
          <NumberField
            label={`Vērtība (${META[type].unit})`}
            value={value}
            onChange={setValue}
            placeholder={type === "heart" ? "72" : type === "glucose" ? "5.4" : "70"}
            step={type === "glucose" ? "0.1" : "1"}
          />
        )}

        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Piezīme (nav obligāti)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={280}
            placeholder="Piem. pēc treniņa"
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
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-all disabled:opacity-70"
        >
          Saglabāt
        </button>
      </form>
    </SectionCard>
  );
}

function NumberField({
  label, value, onChange, placeholder, step = "1",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
      />
    </div>
  );
}
