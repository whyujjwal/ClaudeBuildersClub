import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  const res = await backendFetch("/users/me/onboarding", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
