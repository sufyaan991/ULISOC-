// Monthly prayer timetable, assembled from two platforms Leicester masjids publish on:
// - Islamic Da'wah Academy (IDA) via salaahtimes.co.uk — current month only.
// - Markaz Quba via Mawaqit — a full-year calendar embedded in the masjid's page.
// Early/Late matches the ISoc's posted timetable: IDA supplies the earlier Fajr, the
// Hanafi Asr and the later Isha; Markaz Quba supplies the later Fajr, the Shafi'i Asr,
// Maghrib and the earlier Isha. If one platform is down, the other fills each gap.

export type MonthRow = {
  day: number;
  fajrEarly: string;
  fajrLate: string;
  sunrise: string;
  dhuhr: string;
  asrEarly: string;
  asrLate: string;
  maghrib: string;
  ishaEarly: string;
  ishaLate: string;
};

export type PrayerTimetable = {
  year: number;
  month: number;
  days: MonthRow[];
  sources: { ida: boolean; markazQuba: boolean };
};

type DayTimes = { fajr?: string; sunrise?: string; dhuhr?: string; asr?: string; maghrib?: string; isha?: string };
type MonthTimes = Record<number, DayTimes>;

const IDA_URL = "https://www.salaahtimes.co.uk/Mosque/Details/15";
const MARKAZ_QUBA_URL = "https://mawaqit.net/en/markaz-quba-islamic-centre-leicester-le2-0nq-united-kingdom";
const REVALIDATE_SECONDS = 6 * 60 * 60;
const TIME = /^\d{2}:\d{2}$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function currentLondonMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "numeric" }).formatToParts(now);
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return { year: value("year"), month: value("month") };
}

async function fetchPage(url: string) {
  const response = await fetch(url, {
    headers: { "user-agent": "ULISOC website prayer timetable (su-islamic@le.ac.uk)" },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

function time(value: string | undefined) {
  return value && TIME.test(value) ? value : undefined;
}

function tableRows(table: string) {
  return [...table.matchAll(/<tr[\s\S]*?<\/tr>/g)].map(row =>
    [...row[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(cell => cell[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim()),
  );
}

// salaahtimes.co.uk masjid pages hold two tables for the current month: jamā'at times
// (used only for its Maghrib column) and beginning times ("Dawn/ Sehri End", Sunrise, ...).
export function parseSalaahTimes(html: string, month: number): MonthTimes {
  const days: MonthTimes = {};
  for (const table of html.split("<table").slice(1)) {
    const [header, ...rows] = tableRows(table.slice(0, table.indexOf("</table>")));
    if (!header) continue;
    const column = (name: string) => header.findIndex(cell => cell.toLowerCase().startsWith(name));
    const beginning = column("sunrise") !== -1;
    const columns = beginning
      ? { fajr: column("dawn"), sunrise: column("sunrise"), dhuhr: column("zohar"), asr: column("asr"), isha: column("eisha") }
      : { maghrib: column("maghrib") };
    for (const row of rows) {
      const date = row[0]?.match(/^\w{3} (\d{1,2}) (\w{3})$/);
      if (!date || date[2] !== MONTHS[month - 1]) continue;
      const day = (days[Number(date[1])] ??= {});
      for (const [key, index] of Object.entries(columns) as [keyof DayTimes, number][]) {
        if (index !== -1) day[key] = time(row[index]);
      }
    }
  }
  return days;
}

// Mawaqit embeds the masjid's settings as `confData = {...}`, including
// "calendar": [ {"1": [fajr, sunrise, dhuhr, asr, maghrib, isha], ...} × 12 months ].
export function parseMawaqit(html: string, month: number): MonthTimes {
  const marker = '"calendar":';
  const start = html.indexOf(marker + "[");
  if (start === -1) throw new Error("Mawaqit calendar not found.");
  const begin = start + marker.length;
  let depth = 0, inString = false, end = begin;
  for (; end < html.length; end++) {
    const char = html[end];
    if (inString) { if (char === "\\") end++; else if (char === '"') inString = false; continue; }
    if (char === '"') inString = true;
    else if (char === "[") depth++;
    else if (char === "]" && --depth === 0) break;
  }
  const calendar = JSON.parse(html.slice(begin, end + 1)) as Record<string, string[]>[];
  const days: MonthTimes = {};
  for (const [day, [fajr, sunrise, dhuhr, asr, maghrib, isha]] of Object.entries(calendar[month - 1] ?? {})) {
    days[Number(day)] = { fajr: time(fajr), sunrise: time(sunrise), dhuhr: time(dhuhr), asr: time(asr), maghrib: time(maghrib), isha: time(isha) };
  }
  return days;
}

async function load(name: string, url: string, parse: (html: string) => MonthTimes) {
  try { return parse(await fetchPage(url)); }
  catch (error) { console.error(`${name} prayer times unavailable`, error); return {}; }
}

const pick = (...values: (string | undefined)[]) => values.find(Boolean);

export async function getPrayerTimetable(year: number, month: number): Promise<PrayerTimetable | null> {
  const [ida, quba] = await Promise.all([
    load("IDA", IDA_URL, html => parseSalaahTimes(html, month)),
    load("Markaz Quba", MARKAZ_QUBA_URL, html => parseMawaqit(html, month)),
  ]);
  const days: MonthRow[] = [];
  const dayCount = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= dayCount; day++) {
    const i = ida[day] ?? {}, q = quba[day] ?? {};
    const row = {
      day,
      fajrEarly: pick(i.fajr, q.fajr),
      fajrLate: pick(q.fajr, i.fajr),
      sunrise: pick(i.sunrise, q.sunrise),
      dhuhr: pick(i.dhuhr, q.dhuhr),
      asrEarly: pick(q.asr, i.asr),
      asrLate: pick(i.asr, q.asr),
      maghrib: pick(q.maghrib, i.maghrib),
      ishaEarly: pick(q.isha, i.isha),
      ishaLate: pick(i.isha, q.isha),
    };
    // A partial month would show wrong times, so treat it as unavailable.
    if (Object.values(row).some(value => value === undefined)) return null;
    days.push(row as MonthRow);
  }
  return { year, month, days, sources: { ida: Object.keys(ida).length > 0, markazQuba: Object.keys(quba).length > 0 } };
}
