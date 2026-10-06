"use client";

import { useEffect, useState } from "react";

export type PrayerTimes = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asrEarly: string;
  asrLate: string;
  maghrib: string;
  isha: string;
};

export default function LivePrayerTimes({
  onLoad,
}: {
  onLoad: (times: PrayerTimes) => void;
}) {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      const date = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
        .format(new Date())
        .replaceAll("/", "-");

      async function getTimes(school: "0" | "1") {
        const params = new URLSearchParams({
          city: "Leicester",
          country: "GB",
          method: "15",
          shafaq: "general",
          school,
          timezonestring: "Europe/London",
        });

        const response = await fetch(
          `https://api.aladhan.com/v1/timingsByCity/${date}?${params}`,
          { signal: controller.signal },
        );

        if (!response.ok) throw new Error("Request failed");

        const result = await response.json();

        if (result.code !== 200 || !result.data?.timings) {
          throw new Error("Invalid response");
        }

        return result.data.timings;
      }

      try {
        const [early, late] = await Promise.all([
          getTimes("0"),
          getTimes("1"),
        ]);
        const loadedTimes: PrayerTimes = {
          fajr: early.Fajr,
          sunrise: early.Sunrise,
          dhuhr: early.Dhuhr,
          asrEarly: early.Asr,
          asrLate: late.Asr,
          maghrib: early.Maghrib,
          isha: early.Isha,
        };

        setTimes(loadedTimes);
        onLoad(loadedTimes);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }

    load();
    return () => controller.abort();
  }, [onLoad]);

  if (error) return <p>Could not load prayer times. Please refresh.</p>;
  if (!times) return <p>Loading prayer times…</p>;

  return null;
}
