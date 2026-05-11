import { ReactNode } from "react";
import {
  Activity,
  HeartPulse,
  FileText,
  CalendarClock,
  Pill,
  Stethoscope,
  Watch,
} from "lucide-react";
import { useI18n } from "@/i18n";

type TabKey =
  | "overview"
  | "measurements"
  | "documents"
  | "appointments"
  | "medications"
  | "doctors"
  | "devices";

const TAB_DEFS: { key: TabKey; labelKey: string; icon: typeof Activity }[] = [
  { key: "overview", labelKey: "dash.tab.overview", icon: Activity },
  { key: "measurements", labelKey: "dash.tab.measurements", icon: HeartPulse },
  { key: "documents", labelKey: "dash.tab.documents", icon: FileText },
  { key: "appointments", labelKey: "dash.tab.appointments", icon: CalendarClock },
  { key: "medications", labelKey: "dash.tab.medications", icon: Pill },
  { key: "doctors", labelKey: "dash.tab.doctors", icon: Stethoscope },
  { key: "devices", labelKey: "dash.tab.devices", icon: Watch },
];

export function DashboardTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="border-b border-border bg-surface-elevated/60 sticky top-16 z-30 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 lg:px-10">
        <nav className="flex gap-1 overflow-x-auto -mb-px">
          {TAB_DEFS.map((def) => {
            const tab = { ...def, label: t(def.labelKey) };
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: typeof Activity;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-surface-elevated border border-border shadow-soft overflow-hidden">
      <header className="p-5 border-b border-border flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <div className="ml-auto">{action}</div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export type { TabKey };
