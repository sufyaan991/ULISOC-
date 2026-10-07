import { NextResponse, type NextRequest } from "next/server";
import { databaseFeaturesEnabled } from "@/lib/features";

// Read-only routes that do not need the database.
const publicApiRoutes = ["/api/prayer-times"];

export function proxy(request: NextRequest) {
  if (!databaseFeaturesEnabled && !publicApiRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.json(
      { error: "This service is temporarily unavailable. Please contact the committee for help." },
      { status: 503, headers: { "Cache-Control": "no-store, private" } },
    );
  }
  return NextResponse.next();
}

// Every other API route relies on database-backed authentication or records.
export const config = { matcher: "/api/:path*" };
