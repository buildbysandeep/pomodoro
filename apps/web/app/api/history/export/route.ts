import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/server-api";

export async function GET() {
  const res = await serverFetch("/api/sessions/export");
  if (!res.ok) {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }
  const csv = await res.text();
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=pomodoro-history.csv",
    },
  });
}
