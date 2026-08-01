import { cookies } from "next/headers";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

export async function serverFetch(path: string, options?: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return fetch(`${SERVER_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
}
