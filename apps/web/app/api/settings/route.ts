import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/server-api";

export async function GET() {
  const res = await serverFetch("/api/settings");
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const res = await serverFetch("/api/settings", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
