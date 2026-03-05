import { auth } from "@/auth";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function backendFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await auth();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (session?.idToken) {
    headers.set("Authorization", `Bearer ${session.idToken}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    return await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
