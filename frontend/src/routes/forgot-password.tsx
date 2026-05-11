import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowLeft, Loader2 } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { z } from "zod";
import { useAuth } from "@/auth";
import { apiFetch } from "@/lib/api";

const emailSchema = z.object({
  email: z.string().email("Ievadi derīgu e-pasta adresi"),
});

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Aizmirsta parole — Vitalo" },
      { name: "description", content: "Atjauno piekļuvi savam Vitalo kontam." },
    ],
  }),
  component: ForgotPasswordPage,
});

type FieldErrors = Partial<Record<"email" | "_form", string>>;

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const data = emailSchema.parse({ email });
      await apiFetch<{ message: string }>("/api/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: data.email }),
      });
      setDone(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fe: FieldErrors = {};
        for (const issue of err.issues) {
          const k = issue.path[0] as keyof FieldErrors;
          if (k && !fe[k]) fe[k] = issue.message;
        }
        setErrors(fe);
      } else if (err instanceof Error) {
        const m = err.message.toLowerCase();
        const msg =
          m.includes("too many") || m.includes("429")
            ? "Pārāk daudz pieprasījumu. Mēģini vēlreiz pēc brīža."
            : m.includes("failed to fetch") || m.includes("timed out")
              ? "Neizdevās sasniegt serveri. Pārbaudi savienojumu."
              : err.message;
        setErrors({ _form: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:block relative bg-hero overflow-hidden">
        <div className="absolute inset-0 grid place-items-center p-16">
          <div className="max-w-md">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary grid place-items-center">
                <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-display text-3xl text-ink">
                Vitalo<span className="text-primary">.</span>
              </span>
            </Link>
            <h2 className="mt-12 font-display text-5xl text-ink leading-[1.05] text-balance">
              Paroles <span className="italic text-primary">atjaunošana</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Nosūtīsim saiti, kur droši iestatīt jaunu paroli.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-6 py-10 lg:p-12">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Atpakaļ uz pieslēgšanos
        </Link>

        <div className="flex-1 grid place-items-center py-10">
          <div className="w-full max-w-md">
            <h1 className="font-display text-4xl text-ink">Aizmirsta parole</h1>
            <p className="mt-2 text-muted-foreground">
              Ievadi reģistrēto e-pastu. Ja konts eksistē, nosūtīsim instrukcijas.
            </p>

            {done ? (
              <div className="mt-8 p-4 rounded-2xl bg-primary/10 text-primary text-sm space-y-3">
                <p>
                  Ja šis e-pasts ir mums zināms, nosūtījām paroles atjaunošanas saiti. Pārbaudi
                  iesūtni un mapi &quot;Junk&quot;/&quot;Reklāmas&quot;.
                </p>
                <Link
                  to="/login"
                  className="inline-block font-medium text-foreground underline underline-offset-2"
                >
                  Atpakaļ uz pieslēgšanos
                </Link>
              </div>
            ) : (
              <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                {errors._form && (
                  <div className="p-3 rounded-2xl bg-destructive/10 text-destructive text-sm">
                    {errors._form}
                  </div>
                )}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    E-pasts
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((x) => ({ ...x, email: undefined }));
                    }}
                    placeholder="vards@example.lv"
                    className={`w-full h-12 px-4 rounded-2xl bg-surface border outline-none transition ${
                      errors.email
                        ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                        : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-all disabled:opacity-70 inline-flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Nosūtīt saiti
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Vitalo
        </p>
      </div>
    </div>
  );
}
