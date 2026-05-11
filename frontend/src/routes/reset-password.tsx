import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowLeft, Loader2 } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { z } from "zod";
import { apiFetch } from "@/lib/api";

const resetSchema = z
  .object({
    password: z.string().min(8, "Vismaz 8 rakstzīmes"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Paroles nesakrīt",
    path: ["password_confirmation"],
  });

export const Route = createFileRoute("/reset-password")({
  validateSearch: (raw: Record<string, unknown>) => ({
    token: typeof raw.token === "string" ? raw.token : "",
    email: typeof raw.email === "string" ? raw.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Jauna parole — Vitalo" },
      { name: "description", content: "Iestati jaunu Vitalo konta paroli." },
    ],
  }),
  component: ResetPasswordPage,
});

type FieldErrors = Partial<Record<"password" | "password_confirmation" | "_form", string>>;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token, email } = Route.useSearch();
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({ password: "", password_confirmation: "" });

  useEffect(() => {
    if (!token || !email) {
      setErrors((e) => ({
        ...e,
        _form: "Trūkst saites datu. Atver saiti no e-pasta vēstules vai pieprasi jaunu.",
      }));
    }
  }, [token, email]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!token || !email) return;
    setSubmitting(true);
    try {
      const data = resetSchema.parse(form);
      await apiFetch<{ message: string }>("/api/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          email,
          password: data.password,
          password_confirmation: data.password_confirmation,
        }),
      });
      setDone(true);
      setTimeout(() => navigate({ to: "/login" }), 2000);
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
          m.includes("failed to fetch") || m.includes("timed out")
            ? "Neizdevās sasniegt serveri. Pārbaudi savienojumu."
            : err.message;
        setErrors({ _form: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const upd = (key: "password" | "password_confirmation", v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const missingParams = !token || !email;

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
              Jauna <span className="italic text-primary">parole</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Izvēlies spēcīgu paroli un nekopē to citur publiski.
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
            <h1 className="font-display text-4xl text-ink">Iestatīt jaunu paroli</h1>
            <p className="mt-2 text-muted-foreground break-all">
              {email ? <>Konts: {email}</> : "E-pasts nav norādīts saitē."}
            </p>

            {done ? (
              <div className="mt-8 p-4 rounded-2xl bg-primary/10 text-primary text-sm">
                Parole nomainīta. Pārvirzām uz pieslēgšanos…
              </div>
            ) : (
              <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                {errors._form && (
                  <div className="p-3 rounded-2xl bg-destructive/10 text-destructive text-sm">
                    {errors._form}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                      Jaunā parole
                    </label>
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {show ? "Slēpt" : "Rādīt"}
                    </button>
                  </div>
                  <input
                    type={show ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => upd("password", e.target.value)}
                    placeholder="••••••••"
                    disabled={missingParams}
                    className={`w-full h-12 px-4 rounded-2xl bg-surface border outline-none transition disabled:opacity-50 ${
                      errors.password
                        ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                        : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-destructive">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Atkārto paroli
                  </label>
                  <input
                    type={show ? "text" : "password"}
                    value={form.password_confirmation}
                    onChange={(e) => upd("password_confirmation", e.target.value)}
                    placeholder="••••••••"
                    disabled={missingParams}
                    className={`w-full h-12 px-4 rounded-2xl bg-surface border outline-none transition disabled:opacity-50 ${
                      errors.password_confirmation
                        ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                        : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.password_confirmation && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.password_confirmation}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || missingParams}
                  className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-all disabled:opacity-70 inline-flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Saglabāt jauno paroli
                </button>

                <p className="text-sm text-muted-foreground text-center">
                  <Link to="/forgot-password" className="text-primary font-medium hover:underline">
                    Pieprasīt jaunu saiti
                  </Link>
                </p>
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
