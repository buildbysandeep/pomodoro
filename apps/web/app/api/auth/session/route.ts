import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeToken, tokenToUser } from "@/lib/token";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ user: null, token: null });
  }

  const payload = decodeToken(token);
  if (!payload) {
    cookieStore.set("token", "", { maxAge: 0, path: "/" });
    return NextResponse.json({ user: null, token: null });
  }

  return NextResponse.json({ user: tokenToUser(payload), token });
}
