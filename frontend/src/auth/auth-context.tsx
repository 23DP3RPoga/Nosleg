/**
 * Autentifikācijas React konteksts: JWT no localStorage, lietotāja dati no /api/me,
 * profila vārds sadalīts no Laravel `name` lauka.
 */
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiFetch, ApiUser, getStoredToken, setStoredToken } from "@/lib/api";

/** Ieraksts no `profiles` tabulas (vārds/uzvārds UI sveicieniem). */
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

type AuthCtx = {
  user: ApiUser | null;
  session: { token: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

/** Apvieno sesiju, lietotāju un profilu; klausās `auth-token-changed` pēc login/logout. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  /** Sinhronizē `user`, admin karogu un `profile` no API lietotāja objekta. */
  const applyUser = useCallback(async (u: ApiUser) => {
    setUser(u);
    setIsAdmin(!!u.is_admin);
    const [first_name, ...rest] = u.name.split(" ");
    const last_name = rest.join(" ") || null;
    setProfile({
      id: u.id,
      first_name: first_name || null,
      last_name,
    });
  }, []);

  /** Pārlādē lietotāju pēc e-pasta apstiprinājuma vai profila izmaiņām. */
  const refreshProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    const { data } = await apiFetch<{ user: ApiUser }>("/api/me", {}, token);
    await applyUser(data.user);
  }, [applyUser]);

  useEffect(() => {
    /** Sākotnējā ielāde: tokens → /api/me; nederīgs tokens tiek notīrīts. */
    const init = async () => {
      const token = getStoredToken();
      if (!token) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const { data } = await apiFetch<{ user: ApiUser }>("/api/me", {}, token);
        setSession({ token });
        await applyUser(data.user);
      } catch {
        setStoredToken(null);
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };
    init();

    /** Kad citā vietā izsauc `setStoredToken`, pārlādē sesiju bez pilnas lapas atjaunošanas. */
    const onTokenChange = () => {
      init();
    };
    window.addEventListener("auth-token-changed", onTokenChange);

    return () => {
      window.removeEventListener("auth-token-changed", onTokenChange);
    };
  }, [applyUser]);

  /** Backend logout (ja iespējams) + pilnīga lokālās sesijas notīrīšana. */
  const signOut = useCallback(async () => {
    const t = getStoredToken();
    if (t) {
      try {
        await apiFetch("/api/logout", { method: "POST" }, t);
      } catch {
        // Always clear local auth state even if backend token is already invalid.
      }
    }
    setStoredToken(null);
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  }, []);

  return (
    <Ctx.Provider value={{ user, session, profile, isAdmin, loading, signOut, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}

/** Piekļuve sesijai; jālieto tikai zem `<AuthProvider>`. */
export function useAuth() {
  return useContext(Ctx);
}
