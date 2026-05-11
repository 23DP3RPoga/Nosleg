import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { MeasurementType } from "@/auth";

export type MeasurementRow = {
  id: string;
  type: MeasurementType;
  systolic: number | null;
  diastolic: number | null;
  value: number | null;
  note: string | null;
  taken_at: string;
};

const TYPE_LABEL: Record<MeasurementType, string> = {
  bp: "Asinsspiediens",
  heart: "Sirds ritms",
  glucose: "Glikoze",
  weight: "Svars",
};

const TYPE_UNIT: Record<MeasurementType, string> = {
  bp: "mmHg",
  heart: "sit/min",
  glucose: "mmol/L",
  weight: "kg",
};

function formatValue(r: MeasurementRow): string {
  if (r.type === "bp") return `${r.systolic ?? "-"}/${r.diastolic ?? "-"}`;
  return r.value != null ? String(r.value) : "-";
}

export function exportMeasurementsPDF(opts: {
  rows: MeasurementRow[];
  patientName?: string;
}) {
  const { rows, patientName } = opts;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Vitalo - Veselibas parskats", 40, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Generets: ${new Date().toLocaleString("lv-LV")}`,
    40,
    58,
  );
  if (patientName) {
    doc.text(`Pacients: ${patientName}`, 40, 72);
  }

  doc.setTextColor(15, 23, 42);
  let cursorY = 110;

  // Summary per type
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Kopsavilkums", 40, cursorY);
  cursorY += 18;

  const types: MeasurementType[] = ["bp", "heart", "glucose", "weight"];
  const summary = types.map((t) => {
    const list = rows.filter((r) => r.type === t);
    const last = list[0];
    const count = list.length;
    let avg = "-";
    if (count > 0) {
      if (t === "bp") {
        const s = list.reduce((a, b) => a + (b.systolic ?? 0), 0) / count;
        const d = list.reduce((a, b) => a + (b.diastolic ?? 0), 0) / count;
        avg = `${s.toFixed(0)}/${d.toFixed(0)}`;
      } else {
        const v = list.reduce((a, b) => a + (b.value ?? 0), 0) / count;
        avg = v.toFixed(t === "glucose" ? 1 : 0);
      }
    }
    return [
      TYPE_LABEL[t],
      String(count),
      last ? formatValue(last) : "-",
      avg,
      TYPE_UNIT[t],
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    head: [["Tips", "Ierakstu skaits", "Pedejais", "Videjais", "Mervieniba"]],
    body: summary,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    styles: { font: "helvetica", fontSize: 10 },
  });

  // History table
  const finalY1 =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? cursorY + 20;
  cursorY = finalY1 + 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Visi merijumi", 40, cursorY);
  cursorY += 10;

  const body = rows.map((r) => [
    new Date(r.taken_at).toLocaleString("lv-LV"),
    TYPE_LABEL[r.type],
    `${formatValue(r)} ${TYPE_UNIT[r.type]}`,
    r.note ?? "",
  ]);

  autoTable(doc, {
    startY: cursorY + 10,
    head: [["Datums", "Tips", "Vertiba", "Piezime"]],
    body,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 100 },
      2: { cellWidth: 90 },
      3: { cellWidth: "auto" },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Vitalo  -  Lapa ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" },
    );
  }

  const filename = `vitalo-parskats-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
