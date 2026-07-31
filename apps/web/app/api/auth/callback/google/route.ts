import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/server-api";
import { decodeToken, tokenToUser } from "@/lib/token";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=google", baseUrl));
  }

  try {
    const res = await serverFetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Google login failed");

    const payload = decodeToken(data.token);
    if (!payload) throw new Error("Invalid token");

    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.redirect(new URL("/", baseUrl));
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(new URL("/auth/login?error=google", baseUrl));
  }
}
