const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${SERVER_URL}${path}`;
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
}

export async function login(credentials: { email: string; password: string }) {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function register(credentials: { name: string; email: string; password: string }) {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function logout() {
  const res = await apiFetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
}

export async function fetchTemplates() {
  const res = await apiFetch("/api/templates");
  if (!res.ok) throw new Error("Failed to load templates");
  return res.json();
}

export async function fetchHistory(params: URLSearchParams) {
  const res = await apiFetch(`/api/sessions/history?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export async function fetchAnalytics(range: "daily" | "weekly" | "monthly") {
  const res = await apiFetch(`/api/analytics?range=${range}`);
  if (!res.ok) throw new Error("Failed to load analytics");
  return res.json();
}

export async function fetchPreferences() {
  const res = await apiFetch("/api/settings");
  if (!res.ok) throw new Error("Failed to load preferences");
  return res.json();
}

export async function updatePreferences(preferences: Record<string, unknown>) {
  const res = await apiFetch("/api/settings", {
    method: "PATCH",
    body: JSON.stringify(preferences),
  });
  if (!res.ok) throw new Error("Failed to update preferences");
  return res.json();
}
