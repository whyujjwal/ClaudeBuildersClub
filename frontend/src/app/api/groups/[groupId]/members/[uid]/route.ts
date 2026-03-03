import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string; uid: string }> }
) {
  const { groupId, uid } = await params;
  const res = await backendFetch(`/groups/${groupId}/members/${uid}`, { method: "DELETE" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
