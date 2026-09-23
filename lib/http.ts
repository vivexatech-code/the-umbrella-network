import { NextResponse } from "next/server";

export function jsonOk(data: object = {}, status = 200) {
  return NextResponse.json({ success: true, ...(data as Record<string, unknown>) }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
