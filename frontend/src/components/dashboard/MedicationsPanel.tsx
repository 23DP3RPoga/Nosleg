import { useEffect, useState, useCallback, FormEvent } from "react";
import { Pill, Plus, Trash2, Clock, X, Power } from "lucide-react";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { medicationSchema } from "@/auth";
import { SectionCard } from "./DashboardTabs";

type Row = {
  id: string;
  medication_name: string;
  dosage: string | null;
  frequency: string;
  times_of_day: string[];
  start_date: string;
  end_date: string | null;
  active: boolean;
  notes: string | null;
};

const FREQS: { value: string; label: string }[] = [
  { value: "daily", label: "Katru dienu" },
  { value: "weekly", label: "Reizi nedēļā" },
  { value: "as_needed", label: "Pēc vajadzības" },
];

export function MedicationsPanel() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const reload = useCallback(async () => {
    const { data } = await apiFetch<Row[]>("/api/medications");
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const cleanTimes = times.filter((t) => t.trim());
      const valid = medicationSchema.parse({
        medication_name: name,
        dosage,
        frequency,
        times_of_day: cleanTimes,
        start_date: startDate,
        end_date: endDate,
        notes,
      });
      await apiFetch("/api/medications", {
        method: "POST",
        body: JSON.stringify({
          medication_name: valid.medication_name,
          dosage: valid.dosage || null,
          frequency: valid.frequency,
          times_of_day: valid.times_of_day,
          start_date: valid.start_date,
          end_date: valid.end_date || null,
          notes: valid.notes || null,
        }),
      });
      setName("");
      setDosage("");
      setFrequency("daily");
      setTimes(["08:00"]);
      setEndDate("");
      setNotes("");
      reload();
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.issues[0]?.message ?? "Nederīgi dati");
      else if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (row: Row) => {
    await apiFetch(`/api/medications/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !row.active }),
    });
    reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Dzēst zāļu atgādinājumu?")) return;
    await apiFetch(`/api/medications/${id}`, { method: "DELETE" });
    reload();
  };

  const updateTime = (idx: number, value: string) => {
    setTimes((t) => t.map((v, i) => (i === idx ? value : v)));
  };
  const addTime = () => setTimes((t) => [...t, "20:00"]);
  const removeTime = (idx: number) => setTimes((t) => t.filter((_, i) => i !== idx));

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <SectionCard title="Pievienot zāles" icon={Plus}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nosaukums" value={name} onChange={setName} placeholder="Vitamīns D3" />
          <Field label="Deva" value={dosage} onChange={setDosage} placeholder="1 tablete · 1000 SV" />

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Biežums
            </label>
            <div className="flex flex-wrap gap-2">
              {FREQS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className={`h-10 px-4 rounded-full text-xs font-medium border transition ${
                    frequency === f.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Atgādinājuma laiki
            </label>
            <div className="space-y-2">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => updateTime(i, e.target.value)}
                    className="flex-1 h-11 px-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(i)}
                      className="w-10 h-10 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label="Noņemt"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {times.length < 6 && (
                <button
                  type="button"
                  onClick={addTime}
                  className="text-xs text-primary hover:underline"
                >
                  + Pievienot laiku
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DateOnly label="Sākums" value={startDate} onChange={setStartDate} />
            <DateOnly label="Beigas" value={endDate} onChange={setEndDate} />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Piezīmes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={400}
              placeholder="Lietot ar ēdienu"
              className="w-full px-4 py-3 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">{error}</p>
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

      <SectionCard title="Manas zāles" icon={Pill}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Ielādē…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nav reģistrētu zāļu.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((m) => {
              const freqLabel = FREQS.find((f) => f.value === m.frequency)?.label ?? m.frequency;
              return (
                <li
                  key={m.id}
                  className={`rounded-2xl border p-4 ${
                    m.active
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {m.medication_name}
                        {m.dosage && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal">
                            {m.dosage}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{freqLabel}</p>
                      {m.times_of_day.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.times_of_day.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-surface border border-border text-foreground"
                            >
                              <Clock className="w-3 h-3" /> {t}
                            </span>
                          ))}
                        </div>
                      )}
                      {(m.end_date || m.notes) && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {m.end_date && `Līdz ${new Date(m.end_date).toLocaleDateString("lv-LV")}`}
                          {m.end_date && m.notes && " · "}
                          {m.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => toggleActive(m)}
                        className={`w-9 h-9 rounded-full grid place-items-center transition ${
                          m.active
                            ? "text-primary hover:bg-primary/10"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        aria-label={m.active ? "Apturēt" : "Aktivizēt"}
                        title={m.active ? "Apturēt" : "Aktivizēt"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(m.id)}
                        className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                        aria-label="Dzēst"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
      />
    </div>
  );
}

function DateOnly({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
      />
    </div>
  );
}
