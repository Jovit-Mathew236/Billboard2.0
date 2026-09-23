import { auth } from "@/lib/firebase/config";

interface ApiOptions {
  method?: "GET" | "POST" | "DELETE" | "PATCH";
  body?: unknown;
}

export async function apiFetch<T>(url: string, { method = "GET", body }: ApiOptions = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data as T;
}
