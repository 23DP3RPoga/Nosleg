/**
 * HTTP klients Laravel backendam: Bearer tokens, JSON, vienota kļūdu izguve.
 * Bāzes URL no `VITE_API_URL` vai lokālais `8000` ports.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY = "auth_token";

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  /** ISO8601 laiks, kad e-pasts apstiprināts; `null` — vēl jāverificē. */
  email_verified_at?: string | null;
};

type ApiResponse<T> = {
  data: T;
  status: number;
};

/** Mēģina izvilkt ziņojumu no Laravel tipiskajiem JSON formātiem (`message`, `errors`, …). */
function parseErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === "object" && payload && "error" in payload) {
    const e = (payload as { error: unknown }).error;
    if (typeof e === "string") return e;
  }
  if (typeof payload === "object" && payload && "message" in payload) {
    const m = (payload as { message: unknown }).message;
    if (typeof m === "string") return m;
    if (Array.isArray(m) && m[0] != null) return String(m[0]);
  }
  if (typeof payload === "object" && payload && "errors" in payload) {
    const errs = (payload as { errors: Record<string, string[]> }).errors;
    const firstKey = Object.keys(errs)[0];
    const first = firstKey ? errs[firstKey] : undefined;
    if (Array.isArray(first) && first[0]) return String(first[0]);
  }
  return `Request failed with status ${status}`;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

/** Saglabā vai dzēš tokenu un paziņo `AuthProvider` caur pielāgotu notikumu. */
export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("auth-token-changed"));
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth-token-changed"));
}

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",
} as const;

/** JSON pieprasījums; `token === null` — apzināti bez Authorization (reti gadījumi). */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<ApiResponse<T>> {
  const authToken = token === null ? null : (token ?? getStoredToken());
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...JSON_HEADERS,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = { message: text.slice(0, 280) };
    }
  }

  if (!res.ok) {
    throw new Error(parseErrorMessage(payload, res.status));
  }

  return { data: payload as T, status: res.status };
}

/** `multipart/form-data` (dokumentu augšupielāde); Content-Type iestata pārlūks. */
export async function apiUpload<T>(path: string, formData: FormData): Promise<ApiResponse<T>> {
  const authToken = getStoredToken();
  const headers: HeadersInit = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
    headers,
  });

  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = { message: text.slice(0, 280) };
    }
  }

  if (!res.ok) {
    throw new Error(parseErrorMessage(payload, res.status));
  }

  return { data: payload as T, status: res.status };
}

/** Lejupielādē bināru atbildi (PDF, attēls) ar to pašu autentifikāciju. */
export async function fetchAuthorizedBlob(path: string): Promise<Blob> {
  const authToken = getStoredToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "*/*",
      "X-Requested-With": "XMLHttpRequest",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      /* nav JSON kļūdas ķermenis */
    }
    throw new Error(parseErrorMessage(payload, res.status));
  }
  return res.blob();
}
