import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";

export async function GET() {
  const res = await backendFetch("/groups/my");
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return NextResponse.json(null);
  }
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
