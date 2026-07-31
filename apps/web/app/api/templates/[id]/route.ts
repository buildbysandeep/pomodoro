import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/server-api";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const res = await serverFetch(`/api/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await serverFetch(`/api/templates/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
