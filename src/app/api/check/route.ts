import { NextResponse } from "next/server";
import { findParticipantByNim } from "@/lib/sheets";
import { isValidNim } from "@/lib/nim";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let nim: unknown;
  try {
    const body = await request.json();
    nim = body?.nim;
  } catch {
    return NextResponse.json({ found: false, error: "invalid-request" }, { status: 400 });
  }

  if (typeof nim !== "string" || !isValidNim(nim)) {
    return NextResponse.json({ found: false, error: "invalid-nim" }, { status: 400 });
  }

  try {
    const result = await findParticipantByNim(nim);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to look up participant:", error);
    return NextResponse.json({ found: false, error: "lookup-failed" }, { status: 500 });
  }
}
