import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await backendFetch("/groups", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
