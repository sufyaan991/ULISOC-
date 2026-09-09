"use client";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { JummahSchedule } from "@/lib/jummah";

type Choice = "early" | "late";
type MonthRow = {
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
type PrayerRoom = {
  id: string;
  name: string;
  campus: string;
  maps?: string;
  image?: string;
};
const prayerRooms: PrayerRoom[] = [
  {
    id: "charles-wilson",
    name: "Charles Wilson",
    campus: "Main campus",
    maps: "https://www.google.com/maps/search/?api=1&query=Charles%20Wilson%20Building%2C%20University%20of%20Leicester",
    image: "/charles-wilson-building.png",
  },
  {
    id: "sir-bob-burgess",
    name: "Sir Bob Burgess",
    campus: "Main campus",
    maps: "https://www.google.com/maps/place/Sir+Bob+Burgess+Building/@52.6189849,-1.1313181,588m/data=!3m1!1e3!4m6!3m5!1s0x487761b83f98eb2b:0x27bd3de42f53a3ee!8m2!3d52.6189849!4d-1.1287431!16s%2Fg%2F11smfxrg22?entry=ttu&g_ep=EgoyMDI2MDgzMS4wIKXMDSoASAFQAw%3D%3D",
    image: "/sir-bob-burgess-building.png",
  },
  {
    id: "maurice-shock",
    name: "Maurice Shock",
    campus: "Main campus",
    maps: "https://www.google.com/maps/place/University+of+Leicester+-+School+of+Biological+Sciences/@52.6236422,-1.1275003,588m/data=!3m2!1e3!4b1!4m6!3m5!1s0x487761253faf14f9:0x12b8c838407f32cc!8m2!3d52.6236422!4d-1.1249254!16s%2Fg%2F1thwzyp_?entry=ttu&g_ep=EgoyMDI2MDgzMS4wIKXMDSoASAFQAw%3D%3D",
    image: "/maurice-shock-building.png",
  },
  {
    id: "brookfield",
    name: "Brookfield Campus",
    campus: "Brookfield",
    maps: "https://www.google.com/maps/place/Brookfield/@52.6221412,-1.1239754,14.38z/data=!4m6!3m5!1s0x48776137d72d553b:0xa599cf351f6d051b!8m2!3d52.6206029!4d-1.1100511!16s%2Fg%2F11b6bkb7t2?entry=ttu&g_ep=EgoyMDI2MDgzMS4wIKXMDSoASAFQAw%3D%3D",
    image: "/brookfield-campus.png",
  },
];
const roomInformation: Record<
  string,
  {
    summary: string;
    facts: Array<{ label: string; value: string; tone?: "yes" | "no" }>;
  }
> = {
  "charles-wilson": {
    summary:
      "Access to the building and prayer facilities depends on the time of day and the university calendar.",
    facts: [
      {
        label: "Wudhu facilities",
        value: "Available · ID card required",
        tone: "yes",
      },
      { label: "Prayer room access", value: "ID card required" },
      {
        label: "Term-time building access",
        value: "ID required before 8am and after 6pm",
      },
      { label: "Holiday building access", value: "ID card always required" },
      {
        label: "Card-access entrance",
        value: "Use the side entrance next to Delic!ous",
      },
    ],
  },
  "sir-bob-burgess": {
    summary:
      "The prayer room requires card access, while the wudhu facilities can be entered without scanning an ID card.",
    facts: [
      {
        label: "Wudhu facilities",
        value: "Available · No ID card required",
        tone: "yes",
      },
      { label: "Prayer room access", value: "ID card required" },
      { label: "Building access", value: "No known time restriction" },
    ],
  },
  "maurice-shock": {
    summary:
      "Access arrangements for this prayer space have not yet been confirmed.",
    facts: [
      { label: "Wudhu facilities", value: "Not available", tone: "no" },
      { label: "Access information", value: "Not currently confirmed" },
    ],
  },
  brookfield: {
    summary:
      "Access arrangements for this prayer space have not yet been confirmed.",
    facts: [
      { label: "Wudhu facilities", value: "Not available", tone: "no" },
      { label: "Access information", value: "Not currently confirmed" },
    ],
  },
};
const september2026: MonthRow[] = [
  [
    1,
    "04:05",
    "04:34",
    "06:14",
    "13:10",
    "16:46",
    "17:45",
    "19:55",
    "21:15",
    "21:28",
  ],
  [
    2,
    "04:08",
    "04:36",
    "06:16",
    "13:09",
    "16:44",
    "17:43",
    "19:53",
    "21:13",
    "21:28",
  ],
  [
    3,
    "04:10",
    "04:38",
    "06:17",
    "13:09",
    "16:42",
    "17:41",
    "19:50",
    "21:10",
    "21:27",
  ],
  [
    4,
    "04:13",
    "04:40",
    "06:19",
    "13:09",
    "16:41",
    "17:39",
    "19:48",
    "21:08",
    "21:24",
  ],
  [
    5,
    "04:15",
    "04:42",
    "06:21",
    "13:08",
    "16:39",
    "17:37",
    "19:46",
    "21:06",
    "21:24",
  ],
  [
    6,
    "04:18",
    "04:44",
    "06:22",
    "13:08",
    "16:38",
    "17:35",
    "19:43",
    "21:03",
    "21:23",
  ],
  [
    7,
    "04:20",
    "04:46",
    "06:24",
    "13:08",
    "16:37",
    "17:34",
    "19:41",
    "21:01",
    "21:20",
  ],
  [
    8,
    "04:22",
    "04:48",
    "06:26",
    "13:07",
    "16:35",
    "17:32",
    "19:39",
    "20:59",
    "21:17",
  ],
  [
    9,
    "04:25",
    "04:50",
    "06:28",
    "13:07",
    "16:33",
    "17:30",
    "19:36",
    "20:56",
    "21:13",
  ],
  [
    10,
    "04:27",
    "04:52",
    "06:29",
    "13:07",
    "16:32",
    "17:28",
    "19:34",
    "20:54",
    "21:10",
  ],
  [
    11,
    "04:29",
    "04:54",
    "06:31",
    "13:06",
    "16:30",
    "17:26",
    "19:32",
    "20:52",
    "21:08",
  ],
  [
    12,
    "04:32",
    "04:56",
    "06:33",
    "13:06",
    "16:29",
    "17:24",
    "19:29",
    "20:49",
    "21:04",
  ],
  [
    13,
    "04:34",
    "04:58",
    "06:34",
    "13:06",
    "16:28",
    "17:22",
    "19:27",
    "20:47",
    "21:03",
  ],
  [
    14,
    "04:36",
    "05:00",
    "06:36",
    "13:05",
    "16:26",
    "17:20",
    "19:24",
    "20:44",
    "21:00",
  ],
  [
    15,
    "04:38",
    "05:02",
    "06:38",
    "13:05",
    "16:24",
    "17:18",
    "19:22",
    "20:42",
    "20:56",
  ],
  [
    16,
    "04:40",
    "05:04",
    "06:39",
    "13:04",
    "16:23",
    "17:16",
    "19:20",
    "20:40",
    "20:55",
  ],
  [
    17,
    "04:43",
    "05:06",
    "06:41",
    "13:04",
    "16:21",
    "17:14",
    "19:17",
    "20:37",
    "20:51",
  ],
  [
    18,
    "04:45",
    "05:08",
    "06:43",
    "13:04",
    "16:19",
    "17:12",
    "19:15",
    "20:35",
    "20:48",
  ],
  [
    19,
    "04:47",
    "05:10",
    "06:44",
    "13:03",
    "16:18",
    "17:10",
    "19:12",
    "20:32",
    "20:47",
  ],
  [
    20,
    "04:49",
    "05:12",
    "06:46",
    "13:03",
    "16:16",
    "17:08",
    "19:10",
    "20:30",
    "20:43",
  ],
  [
    21,
    "04:51",
    "05:14",
    "06:48",
    "13:03",
    "16:14",
    "17:06",
    "19:08",
    "20:28",
    "20:41",
  ],
  [
    22,
    "04:53",
    "05:16",
    "06:49",
    "13:02",
    "16:13",
    "17:04",
    "19:05",
    "20:25",
    "20:39",
  ],
  [
    23,
    "04:55",
    "05:17",
    "06:51",
    "13:02",
    "16:11",
    "17:02",
    "19:03",
    "20:23",
    "20:35",
  ],
  [
    24,
    "04:57",
    "05:19",
    "06:53",
    "13:02",
    "16:09",
    "17:00",
    "19:01",
    "20:21",
    "20:34",
  ],
  [
    25,
    "04:59",
    "05:21",
    "06:54",
    "13:01",
    "16:07",
    "16:58",
    "18:58",
    "20:18",
    "20:30",
  ],
  [
    26,
    "05:01",
    "05:22",
    "06:56",
    "13:01",
    "16:05",
    "16:56",
    "18:56",
    "20:16",
    "20:28",
  ],
  [
    27,
    "05:03",
    "05:24",
    "06:58",
    "13:01",
    "16:03",
    "16:54",
    "18:53",
    "20:13",
    "20:26",
  ],
  [
    28,
    "05:05",
    "05:25",
    "07:00",
    "13:00",
    "16:01",
    "16:52",
    "18:51",
    "20:11",
    "20:22",
  ],
  [
    29,
    "05:07",
    "05:27",
    "07:01",
    "13:00",
    "15:59",
    "16:50",
    "18:49",
    "20:09",
    "20:21",
  ],
  [
    30,
    "05:09",
    "05:29",
    "07:03",
    "13:00",
    "15:57",
    "16:48",
    "18:46",
    "20:06",
    "20:18",
  ],
].map(
  ([
    day,
    fajrEarly,
    fajrLate,
    sunrise,
    dhuhr,
    asrEarly,
    asrLate,
    maghrib,
    ishaEarly,
    ishaLate,
  ]) => ({
    day: +day,
    fajrEarly: String(fajrEarly),
    fajrLate: String(fajrLate),
    sunrise: String(sunrise),
    dhuhr: String(dhuhr),
    asrEarly: String(asrEarly),
    asrLate: String(asrLate),
    maghrib: String(maghrib),
    ishaEarly: String(ishaEarly),
    ishaLate: String(ishaLate),
  }),
);
const hijriMonths = [
  "Muḥarram",
  "Ṣafar",
  "Rabīʿ al-Awwal",
  "Rabīʿ al-Thānī",
  "Jumādā al-Ūlā",
  "Jumādā al-Thāniyah",
  "Rajab",
  "Shaʿbān",
  "Ramaḍān",
  "Shawwāl",
  "Dhū al-Qaʿdah",
  "Dhū al-Ḥijjah",
];
function mins(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
function formatHijriDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("day")} ${hijriMonths[Number(part("month")) - 1]} ${part("year")} AH`;
}
function countdown(now: Date | null, target: string, tomorrow = false) {
  if (!now) return "--h --m --s";
  const targetDate = new Date(now);
  const [h, m] = target.split(":").map(Number);
  targetDate.setHours(h, m, 0, 0);
  if (tomorrow || targetDate.getTime() <= now.getTime())
    targetDate.setDate(targetDate.getDate() + 1);
  const total = Math.max(
    0,
    Math.floor((targetDate.getTime() - now.getTime()) / 1000),
  );
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export function PrayerDashboard({ jummah }: { jummah: JummahSchedule | null }) {
  const [now, setNow] = useState<Date | null>(null);
  const [choice, setChoice] = useState<Choice>("early");
  const [timetableOpen, setTimetableOpen] = useState(false);
  const [timetableClosing, setTimetableClosing] = useState(false);
  const [activeRoom, setActiveRoom] = useState<PrayerRoom | null>(null);
  const [roomClosing, setRoomClosing] = useState(false);
  const closeTimetable = () => {
    if (timetableClosing) return;
    setTimetableClosing(true);
    window.setTimeout(() => {
      setTimetableOpen(false);
      setTimetableClosing(false);
    }, 220);
  };
  const closeRoom = () => {
    if (roomClosing) return;
    setRoomClosing(true);
    window.setTimeout(() => {
      setActiveRoom(null);
      setRoomClosing(false);
    }, 220);
  };
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!timetableOpen) return;
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && closeTimetable();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [timetableOpen]);
  useEffect(() => {
    if (!activeRoom) return;
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && closeRoom();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeRoom]);
  const today =
    now && now.getFullYear() === 2026 && now.getMonth() === 8
      ? september2026[now.getDate() - 1]
      : september2026[0];
  const prayers = useMemo(
    () => [
      {
        name: "Fajr",
        short: "Fajr",
        begins: choice === "early" ? today.fajrEarly : today.fajrLate,
      },
      { name: "Dhuhr", short: "Dhuhr", begins: today.dhuhr },
      {
        name: "Asr",
        short: "Asr",
        begins: choice === "late" ? today.asrLate : today.asrEarly,
      },
      { name: "Maghrib", short: "Maghrib", begins: today.maghrib },
      {
        name: "Isha",
        short: "Isha",
        begins: choice === "early" ? today.ishaEarly : today.ishaLate,
      },
    ],
    [choice, today],
  );
  const current = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const nextIndex = prayers.findIndex((p) => mins(p.begins) > current);
  const active = nextIndex === -1 ? 0 : nextIndex;
  const tomorrow = nextIndex === -1;
  const next = prayers[active];
  const displayedTimes = [
    prayers[0],
    { name: "Sunrise", short: "Sunrise", begins: today.sunrise },
    ...prayers.slice(1),
  ];
  const activeDisplay = active === 0 ? 0 : active + 1;
  const fridayMode = now
    ? now.getDay() === 5 ||
      (now.getDay() === 4 && current >= mins(today.maghrib))
    : false;
  const date =
    now?.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }) ?? "Today";
  const islamicDate = now ? formatHijriDate(now) : "";
  return (
    <div className="wrap">
      {fridayMode && <Jummah schedule={jummah} featured />}
      <section className="prayer-hero">
        <div>
          <div className="date-lockup">
            <p className="eyebrow">{date}</p>
            {islamicDate && (
              <p className="eyebrow islamic-date">{islamicDate}</p>
            )}
          </div>
          <h1 className="display page-title">
            PRAYER
            <br />
            <span className="red">TIMES</span>
          </h1>
          <div className="preferences">
            <Preference label="Prayer time preference">
              <Tabs
                value={choice}
                onValueChange={(v) => setChoice(v as Choice)}
              >
                <TabsList className="choice-list">
                  <TabsTrigger value="early" className="choice">
                    Early
                  </TabsTrigger>
                  <TabsTrigger value="late" className="choice">
                    Late
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </Preference>
          </div>
        </div>
        <div className="countdown-card">
          <span className="eyebrow">
            Time until {next.short}
            {tomorrow ? " tomorrow" : ""}
          </span>
          <div className="countdown">
            {countdown(now, next.begins, tomorrow)}
          </div>
          <div className="target">
            <span>{next.short} begins</span>
            <strong>{next.begins}</strong>
          </div>
        </div>
      </section>
      <section
        className="prayer-strip"
        aria-label="Today's selected prayer times and sunrise"
      >
        {displayedTimes.map((p, i) => (
          <article
            className={
              i === activeDisplay
                ? "prayer-cell active"
                : p.short === "Sunrise"
                  ? "prayer-cell sunrise"
                  : "prayer-cell"
            }
            key={p.short}
          >
            <span>{p.short}</span>
            <strong>{p.begins}</strong>
          </article>
        ))}
      </section>
      <div className="quick-actions">
        <button
          className="action red-action"
          type="button"
          onClick={() => setTimetableOpen(true)}
        >
          View monthly timetable <span>↗</span>
        </button>
        <a className="action" href="#rooms">
          Find a prayer room <span>↗</span>
        </a>
      </div>
      {!fridayMode && <Jummah schedule={jummah} />}
      <section className="info-grid" id="rooms">
        <div>
          <p className="eyebrow">On campus</p>
          <h2 className="display section-title">
            WHERE TO
            <br />
            PRAY
          </h2>
        </div>
        <div className="room-grid">
          {prayerRooms.map((room, index) => (
            <button
              className="room-card"
              type="button"
              key={room.id}
              onClick={() => setActiveRoom(room)}
            >
              {room.image && (
                <span
                  className="room-photo"
                  style={{ backgroundImage: `url(${room.image})` }}
                  aria-hidden="true"
                />
              )}
              <span className="room-number">0{index + 1}</span>
              <span className="room-campus">{room.campus}</span>
              <strong>{room.name}</strong>
              <span className="room-open">
                View room <b>↗</b>
              </span>
            </button>
          ))}
        </div>
      </section>
      {activeRoom && (
        <PrayerRoomDetail
          room={activeRoom}
          onClose={closeRoom}
          closing={roomClosing}
        />
      )}{" "}
      {timetableOpen && (
        <MonthlyTimetable onClose={closeTimetable} closing={timetableClosing} />
      )}
      <style jsx>{`
        .prayer-hero {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 50px;
          align-items: end;
        }
        .preferences {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: -18px;
          margin-bottom: 8px;
        }
        .preference {
          border: 1px solid var(--border);
          padding: 12px 14px;
          background: #100e0e;
          min-width: 210px;
        }
        .preference-label {
          display: block;
          color: #8c8480;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 8px;
        }
        .preference-help {
          display: block;
          color: #8c8480;
          margin-top: 9px;
          font-size: 11px;
        }
        .countdown-card {
          border: 1px solid #4e2024;
          padding: 30px;
          background: linear-gradient(145deg, #170e0f, #100e0e);
          box-shadow: inset 4px 0 #b10008;
        }
        .countdown {
          font-size: clamp(42px, 5.6vw, 74px);
          font-weight: 800;
          letter-spacing: -0.055em;
          line-height: 1;
          margin: 28px 0;
        }
        .target {
          display: flex;
          justify-content: space-between;
          align-items: end;
          border-top: 1px solid var(--border);
          padding-top: 18px;
          color: #aaa;
        }
        .target strong {
          font-size: 30px;
          color: #fff;
        }
        .prayer-strip {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border: 1px solid var(--border);
          margin-top: 42px;
        }
        .prayer-cell {
          min-width: 0;
          padding: 22px 18px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .prayer-cell:last-child {
          border: 0;
        }
        .prayer-cell span {
          text-transform: uppercase;
          color: #aaa;
          font-size: 13px;
          font-weight: 800;
        }
        .prayer-cell strong {
          font-size: 28px;
        }
        .prayer-cell.active {
          background: #b10008;
        }
        .prayer-cell.active span {
          color: #fff;
        }
        .quick-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          margin: 0 0 100px;
          gap: 12px;
        }
        .action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid var(--border);
          padding: 19px 22px;
          text-transform: uppercase;
          font:
            800 13px Arial,
            Helvetica,
            sans-serif;
          color: #fff;
          background: transparent;
          cursor: pointer;
          text-align: left;
        }
        .red-action {
          background: #b10008;
          border-color: #b10008;
        }
        .jummah {
          margin: 0 0 100px;
          border: 1px solid var(--border);
          padding: 34px;
        }
        .jummah.featured {
          margin-bottom: 54px;
          background: #b10008;
          border-color: #b10008;
        }
        .jummah-head {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 40px;
          align-items: end;
        }
        .jummah-title {
          font-size: clamp(50px, 7vw, 90px);
          margin: 8px 0;
        }
        .jummah-venue {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 5px;
        }
        .jummah-detail {
          color: #aaa;
          margin: 0;
        }
        .featured .jummah-detail {
          color: #fff;
        }
        .directions {
          display: inline-block;
          margin-top: 18px;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 900;
          border-bottom: 2px solid currentColor;
          padding-bottom: 4px;
        }
        .jummah-times {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .jummah-time {
          border: 1px solid #4b3d3d;
          padding: 18px;
        }
        .featured .jummah-time {
          border-color: #d76c70;
        }
        .jummah-time h3 {
          margin: 0 0 12px;
          text-transform: uppercase;
          font-size: 13px;
        }
        .jummah-time dl {
          margin: 0;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px 18px;
        }
        .jummah-time dt {
          color: #aaa;
        }
        .featured .jummah-time dt {
          color: #fff;
        }
        .jummah-time dd {
          margin: 0;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }
        .sisters-note {
          margin: 24px 0 0;
          padding: 16px 18px;
          background: #21190d;
          border-left: 4px solid #c9a96e;
          color: #f5f0ed;
        }
        .featured .sisters-note {
          background: #7e0006;
          border-left-color: #fff;
        }
        .jummah-announcement {
          margin: 14px 0 0;
          font-weight: 700;
        }
        .pending {
          color: #aaa;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 60px;
          padding: 90px 0;
          border-top: 1px solid var(--border);
        }
        .location {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          padding: 22px 0;
          border-bottom: 1px solid var(--border);
        }
        .location strong {
          font-size: 18px;
        }
        .location span {
          grid-row: 2;
          color: #89817e;
        }
        .location b {
          grid-row: 1/3;
          grid-column: 2;
          align-self: center;
          color: #c52028;
        }
        @media (max-width: 760px) {
          .prayer-hero {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .preferences {
            margin-top: -6px;
          }
          .preference {
            min-width: calc(50% - 6px);
            flex: 1;
          }
          .countdown-card {
            padding: 24px;
          }
          .countdown {
            font-size: 43px;
          }
          .prayer-strip {
            overflow-x: auto;
            grid-template-columns: repeat(5, 132px);
            margin-top: 18px;
          }
          .quick-actions {
            grid-template-columns: 1fr;
            margin-bottom: 64px;
          }
          .jummah {
            padding: 24px;
            margin-bottom: 64px;
          }
          .jummah-head {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .jummah-times {
            grid-template-columns: 1fr;
          }
          .info-grid {
            grid-template-columns: 1fr;
            gap: 34px;
            padding: 64px 0;
          }
        }
      `}</style>
      <style jsx>{`
        .date-lockup {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .date-lockup p {
          margin: 0;
        }
        .islamic-date {
          color: #c9a96e;
        }
        .target {
          align-items: center;
          padding-top: 20px;
        }
        .target span {
          font-size: 16px;
          font-weight: 700;
          color: #f5f0ed;
          letter-spacing: 0.01em;
        }
        .target strong {
          font-size: 28px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .prayer-strip {
          grid-template-columns: repeat(6, 1fr);
          margin-bottom: 64px;
        }
        .prayer-cell.sunrise {
          background: #100e0e;
        }
        .prayer-cell.sunrise span {
          color: #c9a96e;
        }
        .table-row {
          grid-template-columns: 1.4fr repeat(6, 1fr);
        }
        @media (max-width: 760px) {
          .target span {
            font-size: 15px;
          }
          .target strong {
            font-size: 26px;
          }
          .prayer-strip {
            grid-template-columns: repeat(6, 132px);
            margin-bottom: 48px;
          }
          .table-row {
            grid-template-columns: 82px repeat(6, 74px);
            width: 544px;
          }
        }
      `}</style>
      <style jsx>{`
        .room-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .room-card {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          min-height: 250px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: linear-gradient(145deg, #151011, #0c0a0a);
          color: #fff;
          padding: 22px;
          text-align: left;
          display: grid;
          grid-template-columns: 1fr auto;
          align-content: space-between;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease;
        }
        .room-card:hover {
          transform: translateY(-3px);
          border-color: #8d2429;
        }
        .room-photo {
          position: absolute;
          z-index: -2;
          inset: 0;
          background-size: cover;
          background-position: center 45%;
          transition: transform 0.35s ease;
        }
        .room-photo:after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(8, 7, 7, 0.12) 4%,
            rgba(8, 7, 7, 0.45) 42%,
            #090808 96%
          );
        }
        .room-card:hover .room-photo {
          transform: scale(1.035);
        }
        .room-number {
          color: #e2252e;
          font-weight: 900;
          text-shadow: 0 1px 8px #000;
        }
        .room-campus {
          color: #eee5e2;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          text-shadow: 0 1px 8px #000;
        }
        .room-card strong {
          grid-column: 1/-1;
          font-size: clamp(22px, 2.3vw, 32px);
          line-height: 1.05;
          align-self: end;
          text-shadow: 0 2px 14px #000;
        }
        .room-open {
          grid-column: 1/-1;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #ffffff3d;
          padding-top: 15px;
          color: #ddd4d1;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 800;
        }
        .room-open b {
          color: #e2252e;
        }
        @media (max-width: 760px) {
          .room-grid {
            grid-template-columns: 1fr;
          }
          .room-card {
            min-height: 220px;
          }
        }
      `}</style>
    </div>
  );
}
function PrayerRoomDetail({
  room,
  onClose,
  closing,
}: {
  room: PrayerRoom;
  onClose: () => void;
  closing: boolean;
}) {
  const information = roomInformation[room.id];
  return (
    <div className={`room-backdrop${closing ? " closing" : ""}`} role="presentation" onMouseDown={onClose}>
      <section
        className="room-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="room-close"
          type="button"
          onClick={onClose}
          aria-label="Close prayer room details"
        >
          ×
        </button>
        <div className="room-video">
          <video
            src="/prayer-room-placeholder.mp4"
            title={`Sample walkthrough video for ${room.name} prayer room`}
            controls
            playsInline
            preload="metadata"
          />
          <span className="placeholder-badge">Temporary walkthrough</span>
        </div>
        <div className="room-copy">
          <p className="eyebrow">{room.campus}</p>
          <h2 id="room-detail-title">{room.name}</h2>
          <p>{information.summary}</p>
          <div className="room-facts">
            {information.facts.map((fact) => (
              <div className="room-fact" key={fact.label}>
                <span>{fact.label}</span>
                <strong
                  className={
                    fact.tone === "yes"
                      ? "facility-yes"
                      : fact.tone === "no"
                        ? "facility-no"
                        : undefined
                  }
                >
                  {fact.value}
                </strong>
              </div>
            ))}
          </div>
          {room.maps ? (
            <a
              className="room-map"
              href={room.maps}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps ↗
            </a>
          ) : (
            <button type="button" disabled>
              Open in Google Maps ↗
            </button>
          )}
        </div>
      </section>
      <style jsx>{`
        .room-backdrop {
          position: fixed;
          z-index: 1000;
          inset: 0;
          background: #000c;
          backdrop-filter: blur(8px);
          display: grid;
          place-items: center;
          padding: 28px;
          animation: window-fade-in 0.28s ease-out both;
        }
        .room-detail {
          position: relative;
          width: min(980px, 100%);
          max-height: 92vh;
          overflow: auto;
          border: 1px solid #443738;
          border-radius: 20px;
          background: #090808;
          padding: 26px;
          display: grid;
          grid-template-columns: minmax(220px, 300px) 1fr;
          gap: 42px;
          align-items: center;
          box-shadow: 0 30px 100px #000;
          animation: window-rise-in 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes window-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes window-rise-in {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .room-backdrop.closing {
          animation: window-fade-out 0.22s ease-in forwards;
          pointer-events: none;
        }
        .room-backdrop.closing .room-detail {
          animation: window-retreat-out 0.22s ease-in forwards;
        }
        @keyframes window-fade-out {
          to { opacity: 0; }
        }
        @keyframes window-retreat-out {
          to { opacity: 0; transform: translateY(10px) scale(0.99); }
        }
        .room-close {
          position: absolute;
          z-index: 2;
          top: 18px;
          right: 18px;
          width: 44px;
          height: 44px;
          border: 1px solid #ffffff47;
          border-radius: 50%;
          background: #0b0909dd;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
        }
        .room-close:hover {
          background: #b10008;
        }
        .room-video {
          position: relative;
          aspect-ratio: 9/16;
          width: 100%;
          max-height: 570px;
          border: 1px solid #5b292c;
          border-radius: 14px;
          background: #090808;
          overflow: hidden;
          box-shadow: inset 4px 0 #b10008;
        }
        .room-video video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .placeholder-badge {
          position: absolute;
          left: 12px;
          right: 12px;
          top: 12px;
          border-radius: 999px;
          background: #090808d9;
          border: 1px solid #ffffff35;
          color: #fff;
          padding: 9px 12px;
          text-align: center;
          text-transform: uppercase;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.05em;
          pointer-events: none;
        }
        .room-copy h2 {
          font-size: clamp(38px, 5vw, 68px);
          line-height: 0.95;
          margin: 10px 0 22px;
        }
        .room-copy > p:not(.eyebrow) {
          color: #aaa;
          line-height: 1.65;
          font-size: 16px;
        }
        .room-facts {
          display: grid;
          gap: 0;
          border-block: 1px solid var(--border);
          margin: 28px 0;
        }
        .room-fact {
          display: grid;
          grid-template-columns: minmax(145px, 0.7fr) 1fr;
          gap: 24px;
          padding: 13px 0;
          border-bottom: 1px solid #2f2928;
        }
        .room-fact:last-child {
          border-bottom: 0;
        }
        .room-facts span {
          color: #918986;
        }
        .room-facts strong {
          text-align: right;
          line-height: 1.4;
        }
        .room-facts .facility-yes {
          color: #f5f0ed;
        }
        .room-facts .facility-no {
          color: #d7ae65;
        }
        .room-copy button,
        .room-map {
          display: inline-block;
          border: 1px solid #4e4542;
          border-radius: 999px;
          background: transparent;
          color: #776f6c;
          padding: 14px 19px;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 900;
        }
        .room-copy button {
          cursor: not-allowed;
        }
        .room-map {
          background: #b10008;
          border-color: #b10008;
          color: #fff;
          transition: background 0.2s ease;
        }
        .room-map:hover {
          background: #d10a13;
        }
        @media (max-width: 720px) {
          .room-backdrop {
            padding: 0;
            place-items: stretch;
          }
          .room-detail {
            width: 100%;
            min-height: 100dvh;
            max-height: none;
            border: 0;
            border-radius: 0;
            grid-template-columns: 1fr;
            padding: 70px 20px 30px;
            gap: 28px;
          }
          .room-video {
            width: auto;
            height: min(400px, 48dvh);
            max-width: 72vw;
            margin: auto;
          }
          .room-copy h2 {
            font-size: 42px;
          }
          .room-fact {
            grid-template-columns: 1fr;
            gap: 5px;
          }
          .room-facts strong {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}
function MonthlyTimetable({ onClose, closing }: { onClose: () => void; closing: boolean }) {
  return (
    <div
      className={`timetable-backdrop${closing ? " closing" : ""}`}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="monthly-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="monthly-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="monthly-header">
          <h2 id="monthly-title" className="display">
            SEPTEMBER 2026
          </h2>
          <div
            className="monthly-brand"
            aria-label="University of Leicester Islamic Society"
          >
            <img src="/isoc-emblem.png" alt="" />
            <span>
              <small>UNIVERSITY OF LEICESTER</small>
              <strong>ISLAMIC SOCIETY</strong>
            </span>
          </div>
          <div className="monthly-actions">
            <button
              type="button"
              className="close-timetable"
              onClick={onClose}
              aria-label="Close monthly timetable"
            >
              Close ×
            </button>
            <button type="button" onClick={() => window.print()}>
              Print or save PDF ↓
            </button>
          </div>
        </header>
        <div className="monthly-scroll">
          <table>
            <thead>
              <tr>
                <th rowSpan={2}>Date</th>
                <th colSpan={2}>Fajr</th>
                <th rowSpan={2}>Sunrise</th>
                <th rowSpan={2}>Dhuhr</th>
                <th colSpan={2}>Asr</th>
                <th rowSpan={2}>Maghrib</th>
                <th colSpan={2}>Isha</th>
              </tr>
              <tr>
                <th>Early</th>
                <th>Late</th>
                <th>Early</th>
                <th>Late</th>
                <th>Early</th>
                <th>Late</th>
              </tr>
            </thead>
            <tbody>
              {september2026.map((row) => {
                const date = new Date(2026, 8, row.day);
                const friday = date.getDay() === 5;
                return (
                  <tr key={row.day} className={friday ? "friday" : undefined}>
                    <th>
                      {date.toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                      })}
                    </th>
                    <td>{row.fajrEarly}</td>
                    <td>{row.fajrLate}</td>
                    <td>{row.sunrise}</td>
                    <td>{row.dhuhr}</td>
                    <td>{row.asrEarly}</td>
                    <td>{row.asrLate}</td>
                    <td>{row.maghrib}</td>
                    <td>{row.ishaEarly}</td>
                    <td>{row.ishaLate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <footer className="monthly-note">
          <span>
            Early / Late follows the preference used on the prayer page.
          </span>
          <strong>ulisoc.com</strong>
        </footer>
      </section>
      <style jsx>{`
        .timetable-backdrop {
          position: fixed;
          z-index: 100;
          inset: 0;
          background: #050404;
          padding: 28px;
          overflow: auto;
          animation: window-fade-in 0.28s ease-out both;
        }
        .monthly-sheet {
          width: min(1380px, 100%);
          min-height: calc(100vh - 56px);
          margin: auto;
          background: #f7f3ef;
          color: #100e0e;
          border-top: 9px solid #b10008;
          padding: 30px 34px;
          box-shadow: 0 30px 90px #000;
          animation: window-rise-in 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes window-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes window-rise-in {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .timetable-backdrop.closing {
          animation: window-fade-out 0.22s ease-in forwards;
          pointer-events: none;
        }
        .timetable-backdrop.closing .monthly-sheet {
          animation: window-retreat-out 0.22s ease-in forwards;
        }
        @keyframes window-fade-out {
          to { opacity: 0; }
        }
        @keyframes window-retreat-out {
          to { opacity: 0; transform: translateY(10px) scale(0.99); }
        }
        .monthly-header {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 24px;
          align-items: center;
          margin-bottom: 24px;
        }
        .monthly-header h2 {
          font-size: clamp(46px, 6vw, 82px);
          margin: 0;
          color: #fff;
        }
        .monthly-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
        }
        .monthly-brand img {
          width: 74px;
          height: 66px;
          object-fit: contain;
        }
        .monthly-brand span {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .monthly-brand small {
          font-size: 10px;
          letter-spacing: 0.075em;
          margin-bottom: 6px;
          font-weight: 800;
        }
        .monthly-brand strong {
          font-size: 19px;
          letter-spacing: 0.015em;
        }
        .monthly-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .monthly-actions button {
          border: 0;
          background: #b10008;
          color: #fff;
          padding: 13px 16px;
          text-transform: uppercase;
          font-weight: 800;
          cursor: pointer;
        }
        .monthly-actions .close-timetable {
          background: #171313;
        }
        .monthly-scroll {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-variant-numeric: tabular-nums;
        }
        th,
        td {
          border: 1px solid #292323;
          padding: 7px 8px;
          text-align: center;
          font-size: 14px;
        }
        thead th {
          background: #b10008;
          color: #fff;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.03em;
        }
        tbody th {
          text-align: left;
          white-space: nowrap;
        }
        tbody tr:nth-child(even):not(.friday) {
          background: #ebe5e0;
        }
        .friday th,
        .friday td {
          background: #971016;
          color: #fff;
          font-weight: 800;
        }
        .monthly-note {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          margin-top: 16px;
          font-size: 12px;
          color: #6b615d;
        }
        .monthly-note strong {
          color: #b10008;
        }
        @media (max-width: 760px) {
          .timetable-backdrop {
            padding: 0;
          }
          .monthly-sheet {
            min-height: 100vh;
            padding: 20px 14px;
            border-top-width: 7px;
          }
          .monthly-header {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .monthly-header h2 {
            font-size: 45px;
          }
          .monthly-brand img {
            width: 58px;
            height: 52px;
          }
          .monthly-brand small {
            font-size: 8px;
          }
          .monthly-brand strong {
            font-size: 15px;
          }
          .monthly-actions {
            display: flex;
            flex-direction: column;
          }
          .monthly-actions button {
            font-size: 11px;
          }
          .monthly-scroll {
            margin-inline: -14px;
            padding-inline: 14px;
          }
          table {
            min-width: 900px;
          }
          th,
          td {
            padding: 7px 6px;
            font-size: 12px;
          }
          .monthly-note {
            flex-direction: column;
            gap: 5px;
          }
        }
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          .timetable-backdrop {
            position: absolute;
            inset: 0;
            padding: 0;
            background: #fff;
            overflow: visible;
          }
          .monthly-sheet {
            width: 100%;
            min-height: 0;
            padding: 0;
            border-top-width: 5px;
            box-shadow: none;
          }
          .monthly-header {
            margin: 8px 0 12px;
          }
          .monthly-header h2 {
            font-size: 36px;
          }
          .monthly-brand img {
            width: 54px;
            height: 48px;
          }
          .monthly-actions {
            display: none;
          }
          .monthly-scroll {
            overflow: visible;
          }
          table {
            min-width: 0;
          }
          th,
          td {
            padding: 3px 4px;
            font-size: 8.5px;
          }
          thead th {
            font-size: 8px;
          }
          .monthly-note {
            margin-top: 8px;
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
}
function Preference({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="preference">
      <span className="preference-label">{label}</span>
      {children}
    </div>
  );
}
function TimeRow({
  label,
  time,
  selected = false,
}: {
  label: string;
  time: string;
  selected?: boolean;
}) {
  return (
    <div className="time-row">
      <span>{label}</span>
      {selected && <em className="selected">Selected</em>}
      <strong>{time}</strong>
    </div>
  );
}
const jummahVenues = {
  "sports-hall": {
    name: "Charles Wilson Sports Hall",
    detail: "Charles Wilson Building, University Road",
    sisters: "Space is available for sisters at the back of the sports hall.",
    maps: "https://www.google.com/maps/search/?api=1&query=Charles+Wilson+Building+University+of+Leicester",
  },
  "studio-013": {
    name: "Percy Gee Building · Studio 0.13",
    detail: "Ground floor, SU Square (Atrium), behind Starbucks",
    sisters: "Sisters should use the Charles Wilson prayer room for Zuhr.",
    maps: "https://www.google.com/maps/search/?api=1&query=Percy+Gee+Building+University+of+Leicester",
  },
} as const;
function Jummah({
  schedule,
  featured = false,
}: {
  schedule: JummahSchedule | null;
  featured?: boolean;
}) {
  const noCampus = schedule?.venue === "no-campus";
  const venue =
    schedule && !noCampus
      ? jummahVenues[schedule.venue as keyof typeof jummahVenues]
      : null;
  const friday = schedule
    ? new Date(`${schedule.fridayDate}T12:00:00`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "This Friday";
  return (
    <section className={featured ? "jummah featured" : "jummah"}>
      <div className="jummah-head">
        <div>
          <p
            className="eyebrow"
            style={featured ? { color: "white" } : undefined}
          >
            {friday}
          </p>
          <h2 className="display jummah-title">JUMU&apos;AH</h2>
          {noCampus ? (
            <>
              <p className="jummah-venue">No on-campus Jumu‘ah</p>
              <p className="jummah-detail">
                There is no Jumu‘ah prayer on campus during the university
                holidays.
              </p>
            </>
          ) : venue ? (
            <>
              <p className="jummah-venue">{venue.name}</p>
              <p className="jummah-detail">{venue.detail}</p>
              <a
                className="directions"
                href={venue.maps}
                target="_blank"
                rel="noreferrer"
              >
                Get directions ↗
              </a>
            </>
          ) : (
            <p className="pending">
              This week&apos;s venue and times will be published shortly.
            </p>
          )}
        </div>
        {schedule && !noCampus && (
          <div className="jummah-times">
            <JummahTime
              title="First Jumu‘ah"
              adhan={schedule.firstAdhan}
              talk={schedule.firstTalk}
              khutbah={schedule.firstKhutbah}
              salah={schedule.firstSalah}
            />
            <JummahTime
              title="Second Jumu‘ah"
              adhan={schedule.secondAdhan}
              khutbah={schedule.secondKhutbah}
              salah={schedule.secondSalah}
            />
          </div>
        )}
      </div>
      {venue && (
        <p className="sisters-note">
          <strong>Sisters:</strong> {venue.sisters}
        </p>
      )}
      {schedule?.announcement && (
        <p className="jummah-announcement">{schedule.announcement}</p>
      )}
    </section>
  );
}
function JummahTime({
  title,
  adhan,
  talk,
  khutbah,
  salah,
}: {
  title: string;
  adhan: string;
  talk?: string | null;
  khutbah: string;
  salah: string;
}) {
  return (
    <article className="jummah-time">
      <h3>{title}</h3>
      <dl>
        <dt>Adhān</dt>
        <dd>{adhan}</dd>
        {talk && (
          <>
            <dt>Talk</dt>
            <dd>{talk}</dd>
          </>
        )}
        <dt>Khuṭbah</dt>
        <dd>{khutbah}</dd>
        <dt>Ṣalāh</dt>
        <dd>{salah}</dd>
      </dl>
    </article>
  );
}
function Location({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="location">
      <strong>{name}</strong>
      <span>{detail}</span>
      <b>Directions ↗</b>
    </div>
  );
}
