import type { JummahSchedule } from "@/lib/jummah";

function posterDate(value: string) {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day),
  );

  return {
    display:
      `${String(day).padStart(2, "0")}/` +
      `${String(month).padStart(2, "0")}/` +
      `${year}`,

    month: new Intl.DateTimeFormat("en-GB", {
      month: "long",
      timeZone: "UTC",
    })
      .format(date)
      .toUpperCase(),

    year: String(year),
  };
}

export function JummahPoster({
  schedule,
}: {
  schedule: Pick<JummahSchedule, "fridayDate">;
}) {
  const date = posterDate(schedule.fridayDate);

  return (
    <article className="jummah-poster">
      <div className="poster-header">
        UNIVERSITY OF LEICESTER
      </div>

      <div className="side-label side-left">
        {date.month}
      </div>

      <div className="side-label side-right">
        {date.year}
      </div>

      <div className="poster-body">
        <div className="top-graphic-row">
          <img
            className="poster-logo"
            src="/ulisoc-logo-red.png"
            alt=""
          />

          <div className="top-line" />
        </div>

        <div className="title-main">
          JUMU&apos;AH
        </div>

        <div className="title-sub">
          ARRANGEMENTS
        </div>

        <div className="bottom-graphic-row">
          <div className="bottom-line" />

          <div className="date-text">
            {date.display}
          </div>
        </div>

        <div className="caption-text">
          check caption for details
        </div>
      </div>

      <div className="poster-footer">
        @ULISOC
      </div>

      <style>{`
        @font-face {
          font-family: "Montserrat";
          src: url("/fonts/montserrat-700.ttf");
          font-weight: 700;
          font-display: block;
        }

        @font-face {
          font-family: "Montserrat";
          src: url("/fonts/montserrat-800.ttf");
          font-weight: 800;
          font-display: block;
        }

        @font-face {
          font-family: "Montserrat";
          src: url("/fonts/montserrat-900.ttf");
          font-weight: 900;
          font-display: block;
        }

        html,
        body {
          margin: 0;
          background: #faf8f5;
        }

        .jummah-poster {
          --poster-red: #a91010;
          position: relative;
          width: 1080px;
          height: 1080px;
          overflow: hidden;
          background: #faf8f5;
          color: var(--poster-red);
          font-family: "Montserrat", Arial, sans-serif;
        }

        .jummah-poster * {
          box-sizing: border-box;
        }

        .poster-header {
          position: absolute;
          top: 26px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 5px;
        }

        .poster-footer {
          position: absolute;
          bottom: 25px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 4px;
        }

        .side-label {
          position: absolute;
          top: 50%;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 5px;
          white-space: nowrap;
        }

        .side-left {
          left: -5px;
          transform:
            translateY(-50%) rotate(-90deg);
        }

        .side-right {
          right: -5px;
          transform:
            translateY(-50%) rotate(90deg);
        }

        .poster-body {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 63%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
        }

        .top-graphic-row {
          display: flex;
          align-items: flex-end;
          width: 100%;
          margin-bottom: 10px;
          gap: 26px;
        }

        .poster-logo {
          width: 88px;
          height: 88px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .top-line,
        .bottom-line {
          flex: 1;
          height: 3px;
          background: var(--poster-red);
        }

        .top-line {
          margin-bottom: 20px;
        }

        .title-main {
          font-size: 126px;
          font-weight: 900;
          line-height: 0.9;
          letter-spacing: 1px;
          text-align: right;
          white-space: nowrap;
        }

        .title-sub {
          font-size: 67px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: 2.5px;
          margin-top: 5px;
          text-align: right;
          white-space: nowrap;
        }

        .bottom-graphic-row {
          display: flex;
          align-items: center;
          width: 100%;
          margin-top: 11px;
          gap: 31px;
        }

        .date-text {
          font-size: 75px;
          font-weight: 700;
          letter-spacing: 1px;
          text-align: right;
          white-space: nowrap;
        }

        .caption-text {
          margin-top: 10px;
          font-size: 37px;
          font-weight: 800;
          text-align: right;
          white-space: nowrap;
        }
      `}</style>
    </article>
  );
}