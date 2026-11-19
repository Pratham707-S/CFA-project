const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: init.signal || controller.signal,
      credentials: "include",
      headers,
    });
    clearTimeout(timeoutId);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error?.message ?? "Request failed.");
    return body as T;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
