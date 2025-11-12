import { NextResponse } from "next/server";
import { getCacheStats } from "@/services/messages.service";

export async function GET() {
  const stats = getCacheStats();
  return NextResponse.json(stats);
}
