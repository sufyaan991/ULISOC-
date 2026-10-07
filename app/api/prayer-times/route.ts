import { currentLondonMonth, getPrayerTimetable } from "@/lib/prayer-times";

export const dynamic = "force-dynamic";

// GET /api/prayer-times            → this month (UK time)
// GET /api/prayer-times?month=2026-11 → a specific month
export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("month")?.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  const { year, month } = requested ? { year: Number(requested[1]), month: Number(requested[2]) } : currentLondonMonth();
  const timetable = await getPrayerTimetable(year, month);
  if (!timetable) {
    return Response.json({ error: "Prayer times are temporarily unavailable." }, { status: 502, headers: { "cache-control": "no-store" } });
  }
  return Response.json(timetable, { headers: { "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" } });
}
