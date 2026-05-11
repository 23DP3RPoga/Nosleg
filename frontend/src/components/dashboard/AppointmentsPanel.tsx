import { useEffect, useState, useCallback, FormEvent } from "react";
import { CalendarClock, Plus, Trash2, MapPin, Stethoscope, Bell } from "lucide-react";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { appointmentSchema } from "@/auth";
import { SectionCard } from "./DashboardTabs";

type Row = {
  id: string;
  doctor_name: string;
  specialty: string | null;
  location: string | null;
  appointment_at: string;
  reminder_at: string | null;
  notes: string | null;
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function AppointmentsPanel() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [doctor, setDoctor] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState("");
  const [reminder, setReminder] = useState("");
  const [notes, setNotes] = useState("");

  const reload = useCallback(async () => {
    const { data } = await apiFetch<Row[]>("/api/appointments");
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
      const valid = appointmentSchema.parse({
        doctor_name: doctor,
        specialty,
        location,
        appointment_at: when ? new Date(when).toISOString() : "",
        reminder_at: reminder ? new Date(reminder).toISOString() : "",
        notes,
      });
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctor_name: valid.doctor_name,
          specialty: valid.specialty || null,
          location: valid.location || null,
          appointment_at: valid.appointment_at,
          reminder_at: valid.reminder_at || null,
          notes: valid.notes || null,
        }),
      });
      setDoctor("");
      setSpecialty("");
      setLocation("");
      setWhen("");
      setReminder("");
      setNotes("");
      reload();
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.issues[0]?.message ?? "Nederīgi dati");
      else if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Dzēst vizīti?")) return;
    await apiFetch(`/api/appointments/${id}`, { method: "DELETE" });
    reload();
  };

  const now = Date.now();

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <SectionCard title="Pievienot vizīti" icon={Plus}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Ārsta vārds" value={doctor} onChange={setDoctor} placeholder="Dr. Jānis Bērziņš" />
          <Field label="Specializācija" value={specialty} onChange={setSpecialty} placeholder="Kardiologs" />
          <Field label="Vieta" value={location} onChange={setLocation} placeholder="Stradiņa slimnīca, 4. kab." />
          <DateField label="Vizītes laiks" value={when} onChange={setWhen} />
          <DateField label="Atgādinājums (nav obligāti)" value={reminder} onChange={setReminder} />

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Piezīmes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Sagatavot iepriekšējos rezultātus"
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
            Saglabāt vizīti
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Manas vizītes" icon={CalendarClock}>
        {loading ? (
          <p className="text-sm text-muted-foreground">Ielādē…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nav ieplānotu vizīšu.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((a) => {
              const dt = new Date(a.appointment_at);
              const past = dt.getTime() < now;
              return (
                <li
                  key={a.id}
                  className={`rounded-2xl border p-4 ${
                    past
                      ? "border-border bg-muted/30 opacity-70"
                      : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{a.doctor_name}</p>
                      {a.specialty && (
                        <p className="text-xs text-muted-foreground">{a.specialty}</p>
                      )}
                      <p className="mt-2 text-sm font-display text-ink">
                        {dt.toLocaleString("lv-LV", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </p>
                      {a.location && (
                        <p className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {a.location}
                        </p>
                      )}
                      {a.reminder_at && (
                        <p className="mt-1 text-xs text-primary inline-flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          Atgādinājums:{" "}
                          {new Date(a.reminder_at).toLocaleString("lv-LV", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      )}
                      {a.notes && (
                        <p className="mt-2 text-xs text-muted-foreground">{a.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => remove(a.id)}
                      className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                      aria-label="Dzēst"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

function DateField({
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
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
      />
    </div>
  );
}

export { toLocalInput };
