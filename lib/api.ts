export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (
  typeof window === "undefined"
    ? "http://localhost:4000"
    : `http://${window.location.hostname}:4000`
);

export class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");

  const controller = new AbortController();
  // Curriculum payloads include lesson content and can take several seconds
  // when Neon is waking from idle. Avoid falling back to preview data too early.
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: init.signal ? AbortSignal.any([controller.signal, init.signal]) : controller.signal,
      credentials: "include",
      headers,
    });
    clearTimeout(timeoutId);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiRequestError(body.error?.message ?? "Request failed.", response.status);
    return body as T;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
