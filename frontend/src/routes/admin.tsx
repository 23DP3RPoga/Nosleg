import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  Users,
  FileText,
  HeartPulse,
  CalendarClock,
  Pill,
  Share2,
  Loader2,
  ShieldOff,
  ShieldCheck,
  ArrowLeft,
  Search,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/auth";
import { PageLayout } from "@/components/marketing/PageLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panelis — Vitalo" },
      { name: "description", content: "Lietotāju pārvaldība un sistēmas statistika." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type AdminUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  roles: ("admin" | "moderator" | "user")[];
};

type Stats = {
  total_users: number;
  total_admins: number;
  total_measurements: number;
  total_documents: number;
  total_appointments: number;
  total_medications: number;
  total_shares: number;
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [busy, setBusy] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
    if (!loading && user && !isAdmin) navigate({ to: "/dashboard" });
  }, [user, isAdmin, loading, navigate]);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const [usersRes, statsRes] = await Promise.all([
        apiFetch<AdminUser[]>("/api/admin/users"),
        apiFetch<Stats[]>("/api/admin/stats"),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data[0] ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Neizdevās ielādēt datus");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const toggleAdmin = async (target: AdminUser) => {
    if (target.id === user?.id) {
      setError("Nevar mainīt savu paša admin statusu");
      return;
    }
    setActingId(target.id);
    setError(null);
    try {
      const nextAdmin = !target.roles.includes("admin");
      await apiFetch(`/api/admin/users/${target.id}/admin`, {
        method: "PATCH",
        body: JSON.stringify({ is_admin: nextAdmin }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Darbība neizdevās");
    } finally {
      setActingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.email.toLowerCase().includes(q) ||
      (u.first_name ?? "").toLowerCase().includes(q) ||
      (u.last_name ?? "").toLowerCase().includes(q)
    );
  });

  if (loading || (!isAdmin && user)) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] grid place-items-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) return null;

  const statCards = stats
    ? [
        { label: "Lietotāji", value: stats.total_users, icon: Users },
        { label: "Administratori", value: stats.total_admins, icon: Shield },
        { label: "Mērījumi", value: stats.total_measurements, icon: HeartPulse },
        { label: "Dokumenti", value: stats.total_documents, icon: FileText },
        { label: "Vizītes", value: stats.total_appointments, icon: CalendarClock },
        { label: "Zāles", value: stats.total_medications, icon: Pill },
        { label: "Dalīšanās saites", value: stats.total_shares, icon: Share2 },
      ]
    : [];

  return (
    <PageLayout>
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Mans pārskats
            </Link>
            <h1 className="mt-2 font-display text-4xl text-ink flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin panelis
            </h1>
            <p className="mt-1 text-muted-foreground">
              Pārvaldi lietotājus un skatīties sistēmas statistiku.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="p-4 rounded-2xl bg-surface border border-border"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <s.icon className="w-4 h-4" />
                <span className="text-xs">{s.label}</span>
              </div>
              <div className="mt-1.5 font-display text-2xl text-ink">
                {busy && !stats ? "—" : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Users list */}
        <div className="mt-10 rounded-3xl bg-surface border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-display text-2xl text-ink">Lietotāji</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Meklēt pēc e-pasta vai vārda"
                className="h-10 w-72 max-w-full pl-9 pr-3 rounded-full bg-background border border-border text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {busy ? (
            <div className="p-12 grid place-items-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Lietotāji nav atrasti.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr className="text-left">
                    <th className="px-5 py-3 font-medium">Lietotājs</th>
                    <th className="px-5 py-3 font-medium">E-pasts</th>
                    <th className="px-5 py-3 font-medium">Reģistrēts</th>
                    <th className="px-5 py-3 font-medium">Lomas</th>
                    <th className="px-5 py-3 font-medium text-right">Darbība</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const isUserAdmin = u.roles.includes("admin");
                    const isSelf = u.id === user?.id;
                    const fullName =
                      [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                      "—";
                    return (
                      <tr
                        key={u.id}
                        className="border-t border-border hover:bg-muted/20"
                      >
                        <td className="px-5 py-3">
                          <div className="font-medium text-ink">{fullName}</div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {u.email}
                          {isSelf && (
                            <span className="ml-2 text-xs text-primary">(tu)</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString("lv-LV")}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {isUserAdmin && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary inline-flex items-center gap-1">
                                <Shield className="w-3 h-3" /> admin
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                              user
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => toggleAdmin(u)}
                            disabled={isSelf || actingId === u.id}
                            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                              isUserAdmin
                                ? "border-destructive/40 text-destructive hover:bg-destructive/10"
                                : "border-primary/40 text-primary hover:bg-primary/10"
                            }`}
                          >
                            {actingId === u.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isUserAdmin ? (
                              <>
                                <ShieldOff className="w-3.5 h-3.5" /> Noņemt admin
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" /> Padarīt par admin
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
