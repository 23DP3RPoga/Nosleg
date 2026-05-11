import { Watch, Smartphone, Bell, Sparkles, Activity, Heart } from "lucide-react";
import { SectionCard } from "./DashboardTabs";

export function DevicesPanel() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-surface-elevated to-surface-elevated border border-border p-8 lg:p-12 shadow-soft">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-[0.18em]">
              <Sparkles className="w-3 h-3" /> Drīzumā
            </span>
            <h2 className="mt-5 font-display text-4xl lg:text-5xl text-ink leading-[1.05]">
              <span className="italic text-primary">Apple Watch</span> savienojums
            </h2>
            <p className="mt-4 text-muted-foreground">
              Strādājam pie native iOS lietotnes, kas automātiski sinhronizēs sirdsdarbību, asinsspiedienu, soļus un miegu no Apple Watch tieši uz tavu Vitalo profilu.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-foreground">
              {[
                "Automātiska sinhronizācija fonā",
                "Brīdinājumi par neparastiem rādītājiem",
                "Mēneša pārskati ārsta vizītēm",
                "Privāti dati — nekad netiek pārdoti",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-4">
            <div className="relative w-44 h-56 rounded-[3rem] bg-gradient-to-b from-foreground to-ink shadow-elevated">
              <div className="absolute inset-3 rounded-[2.5rem] bg-background flex flex-col items-center justify-center gap-2">
                <Heart className="w-8 h-8 text-primary fill-primary/30" />
                <p className="font-display text-3xl text-ink">72</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">BPM</p>
              </div>
              <div className="absolute -right-2 top-1/3 w-3 h-10 bg-foreground rounded-r-md" />
            </div>
            <p className="text-xs text-muted-foreground">Apple Watch · Vitalo app</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Pieejams tagad" icon={Activity}>
          <p className="text-sm text-muted-foreground">
            Manuāli pievieno mērījumus sadaļā <span className="text-foreground font-medium">Mērījumi</span>. Visi dati tiek šifrēti un sinhronizēti starp ierīcēm.
          </p>
        </SectionCard>

        <SectionCard title="iOS lietotne" icon={Smartphone}>
          <p className="text-sm text-muted-foreground">
            Beta testēšana sāksies <span className="text-foreground font-medium">2026. gada vasarā</span>. Plānotas Apple Health, Garmin un Fitbit integrācijas.
          </p>
        </SectionCard>

        <SectionCard title="Pievienoties gaidīšanas sarakstam" icon={Bell}>
          <WaitlistForm />
        </SectionCard>
      </div>
    </div>
  );
}

function WaitlistForm() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const emailEl = form.elements.namedItem("waitlist-email") as HTMLInputElement | null;
        if (emailEl?.value) {
          alert(`Paldies! Tu esi pievienots gaidīšanas sarakstam: ${emailEl.value}`);
          form.reset();
        }
      }}
      className="space-y-3"
    >
      <input
        name="waitlist-email"
        type="email"
        required
        placeholder="tavs@epasts.lv"
        className="w-full h-10 px-4 rounded-full bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
      />
      <button
        type="submit"
        className="w-full h-10 rounded-full bg-gradient-primary text-primary-foreground font-medium text-sm inline-flex items-center justify-center gap-2"
      >
        <Watch className="w-4 h-4" /> Paziņot man
      </button>
    </form>
  );
}
