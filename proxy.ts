import { NextResponse } from "next/server";
import { databaseFeaturesEnabled } from "@/lib/features";

export function proxy() {
  if (!databaseFeaturesEnabled) {
    return NextResponse.json(
      { error: "This service is temporarily unavailable. Please contact the committee for help." },
      { status: 503, headers: { "Cache-Control": "no-store, private" } },
    );
  }
  return NextResponse.next();
}

// Every current API route relies on database-backed authentication or records.
export const config = { matcher: "/api/:path*" };
