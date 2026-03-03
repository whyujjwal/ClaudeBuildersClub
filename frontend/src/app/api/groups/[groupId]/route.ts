import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const res = await backendFetch(`/groups/${groupId}`, { method: "DELETE" });
  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
