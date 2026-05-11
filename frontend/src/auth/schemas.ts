/**
 * Zod validācijas shēmas — kopīgas frontend un API līmeņa pārbaudēm.
 * Kļūdu ziņojumu virknes šobrīd galvenokārt latviski (Laravel atbildes var būt angliski).
 */
import { z } from "zod";

// --- Reģistrācija un pieslēgšanās ---
export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Vārds ir par īsu").max(50),
  lastName: z.string().trim().min(2, "Uzvārds ir par īss").max(50),
  email: z.string().trim().toLowerCase().email("Nederīgs e-pasts"),
  password: z
    .string()
    .min(8, "Vismaz 8 simboli")
    .regex(/[A-Z]/, "Vismaz viens lielais burts")
    .regex(/[0-9]/, "Vismaz viens cipars"),
  acceptTerms: z.literal(true, { message: "Jāpiekrīt noteikumiem" }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Nederīgs e-pasts"),
  password: z.string().min(1, "Ievadi paroli"),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Ievadi vārdu").max(255),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Ievadi paroli"),
  confirm_email: z.string().trim().toLowerCase().email("Nederīgs e-pasts"),
});

// --- Veselības mērījumi (asinsspiediens, sirds ritms, u.c.) ---
export const measurementInputSchema = z
  .object({
    type: z.enum(["bp", "heart", "glucose", "weight"]),
    systolic: z.number().min(50).max(260).optional(),
    diastolic: z.number().min(30).max(180).optional(),
    value: z.number().min(0).max(1000).optional(),
    note: z.string().max(280).optional(),
    taken_at: z.string(),
  })
  .refine(
    (d) =>
      d.type === "bp"
        ? d.systolic != null && d.diastolic != null
        : d.value != null,
    { message: "Trūkst vērtības" }
  );

// --- Ārstu vizītes ---
export const appointmentSchema = z.object({
  doctor_name: z.string().trim().min(2, "Ievadi ārsta vārdu").max(120),
  specialty: z.string().trim().max(120).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  appointment_at: z.string().min(1, "Norādi datumu un laiku"),
  reminder_at: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

// --- Zāļu plāni ---
export const medicationSchema = z.object({
  medication_name: z.string().trim().min(2, "Ievadi nosaukumu").max(120),
  dosage: z.string().trim().max(80).optional().or(z.literal("")),
  frequency: z.string().min(1).default("daily"),
  times_of_day: z.array(z.string()).max(8),
  start_date: z.string().min(1, "Norādi sākuma datumu"),
  end_date: z.string().optional().or(z.literal("")),
  notes: z.string().max(400).optional().or(z.literal("")),
});

// --- Dokumentu metadati augšupielādei ---
export const documentMetaSchema = z.object({
  title: z.string().trim().min(1, "Nosaukums ir obligāts").max(120),
  category: z.enum(["lab", "prescription", "image", "report", "other"]),
  note: z.string().max(400).optional().or(z.literal("")),
});

// --- Lietotāja saglabātie ārsti ---
export const userDoctorSchema = z.object({
  full_name: z.string().trim().min(2, "Ievadi ārsta vārdu").max(120),
  specialty: z.string().trim().max(120).optional().or(z.literal("")),
  clinic: z.string().trim().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Nederīgs e-pasts").optional().or(z.literal("")),
  notes: z.string().max(400).optional().or(z.literal("")),
});

// --- Drošās koplietošanas saites parametri ---
export const shareSchema = z.object({
  hours: z.number().min(1).max(720),
  recipient_email: z.string().trim().email("Nederīgs e-pasts").optional().or(z.literal("")),
  recipient_note: z.string().max(300).optional().or(z.literal("")),
});

/** Atļautie mērījumu veidi API un grafikiem. */
export type MeasurementType = "bp" | "heart" | "glucose" | "weight";
