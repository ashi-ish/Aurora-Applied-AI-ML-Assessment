import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;
  const timeout = process.env.EXTERNAL_API_TIMEOUT;

  return NextResponse.json({
    baseUrlExists: !!baseUrl,
    baseUrl: baseUrl ? `${baseUrl.substring(0, 20)}...` : "NOT SET",
    baseUrlLength: baseUrl?.length || 0,
    timeoutExists: !!timeout,
    timeout: timeout || "NOT SET",
    // Check for hidden characters
    baseUrlCharCodes: baseUrl
      ? Array.from(baseUrl.substring(0, 10)).map((c) => c.charCodeAt(0))
      : [],
  });
}
