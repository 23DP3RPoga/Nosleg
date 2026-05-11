import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { MeasurementType } from "@/auth";
import { SectionCard } from "./DashboardTabs";

type Row = {
  id: string;
  type: MeasurementType;
  systolic: number | null;
  diastolic: number | null;
  value: number | null;
  taken_at: string;
};

const COLORS: Record<MeasurementType, { primary: string; secondary?: string; label: string; unit: string }> = {
  bp: { primary: "hsl(var(--primary))", secondary: "hsl(var(--destructive))", label: "Asinsspiediens", unit: "mmHg" },
  heart: { primary: "hsl(var(--destructive))", label: "Sirds ritms", unit: "sit/min" },
  glucose: { primary: "hsl(var(--warning, 38 92% 50%))", label: "Glikoze", unit: "mmol/L" },
  weight: { primary: "hsl(var(--accent-foreground))", label: "Svars", unit: "kg" },
};

export function MeasurementChart({
  rows,
  type,
}: {
  rows: Row[];
  type: MeasurementType;
}) {
  const data = useMemo(() => {
    return rows
      .filter((r) => r.type === type)
      .slice(0, 30)
      .reverse()
      .map((r) => ({
        date: new Date(r.taken_at).toLocaleDateString("lv-LV", {
          day: "numeric",
          month: "short",
        }),
        systolic: r.systolic,
        diastolic: r.diastolic,
        value: r.value,
      }));
  }, [rows, type]);

  const meta = COLORS[type];

  if (data.length === 0) {
    return (
      <SectionCard title={`${meta.label} - tendence`} icon={TrendingUp}>
        <p className="text-sm text-muted-foreground py-8 text-center">
          Vēl nav datu. Pievieno mērījumus, lai redzētu grafikus.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={`${meta.label} - tendence`} icon={TrendingUp}>
      <div className="h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--surface-elevated, var(--background)))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v} ${meta.unit}`, ""]}
            />
            {type === "bp" ? (
              <>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Sistoliskais"
                  stroke={meta.primary}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastoliskais"
                  stroke={meta.secondary}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                name={meta.label}
                stroke={meta.primary}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
