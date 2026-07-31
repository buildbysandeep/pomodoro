import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/server-api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const res = await serverFetch(`/api/sessions/history?${searchParams.toString()}`);
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
