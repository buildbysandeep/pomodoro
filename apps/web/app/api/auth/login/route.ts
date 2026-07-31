import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/server-api";
import { decodeToken, tokenToUser } from "@/lib/token";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await serverFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const payload = decodeToken(data.token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set("token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return NextResponse.json({ user: tokenToUser(payload), token: data.token });
}
