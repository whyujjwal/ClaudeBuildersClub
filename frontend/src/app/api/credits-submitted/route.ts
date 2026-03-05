import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";

export async function POST() {
  const res = await backendFetch("/users/me/credits-submitted", {
    method: "POST",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
