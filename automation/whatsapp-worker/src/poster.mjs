import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const moduleDir = path.dirname(
  fileURLToPath(import.meta.url),
);

const workerDir = path.resolve(
  moduleDir,
  "..",
);

function createTestPosterHtml({
  dateValue,
  logoDataUrl,
  apiBase,
}) {
  const [year, month, day] =
    dateValue.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day),
  );

  const displayDate =
    `${String(day).padStart(2, "0")}/` +
    `${String(month).padStart(2, "0")}/` +
    `${year}`;

  const monthName =
    new Intl.DateTimeFormat("en-GB", {
      month: "long",
      timeZone: "UTC",
    })
      .format(date)
      .toUpperCase();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <style>
    @font-face {
      font-family: "Montserrat";
      src: url("${apiBase}/fonts/montserrat-700.ttf");
      font-weight: 700;
      font-style: normal;
      font-display: block;
    }

    @font-face {
      font-family: "Montserrat";
      src: url("${apiBase}/fonts/montserrat-800.ttf");
      font-weight: 800;
      font-style: normal;
      font-display: block;
    }

    @font-face {
      font-family: "Montserrat";
      src: url("${apiBase}/fonts/montserrat-900.ttf");
      font-weight: 900;
      font-style: normal;
      font-display: block;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 1080px;
      height: 1080px;
      margin: 0;
      overflow: hidden;
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
      font-family:
        "Montserrat",
        Arial,
        sans-serif;
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
        translateY(-50%)
        rotate(-90deg);
    }

    .side-right {
      right: -5px;
      transform:
        translateY(-50%)
        rotate(90deg);
    }

    .poster-body {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 63%;
      display: flex;
      flex-direction: column;
      transform: translate(-50%, -50%);
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
      margin-top: 5px;
      font-size: 67px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: 2.5px;
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
  </style>
</head>

<body>
  <article class="jummah-poster">
    <div class="poster-header">
      UNIVERSITY OF LEICESTER
    </div>

    <div class="side-label side-left">
      ${monthName}
    </div>

    <div class="side-label side-right">
      ${year}
    </div>

    <div class="poster-body">
      <div class="top-graphic-row">
        <img
          class="poster-logo"
          src="${logoDataUrl}"
          alt=""
        >

        <div class="top-line"></div>
      </div>

      <div class="title-main">
        JUMU'AH
      </div>

      <div class="title-sub">
        ARRANGEMENTS
      </div>

      <div class="bottom-graphic-row">
        <div class="bottom-line"></div>

        <div class="date-text">
          ${displayDate}
        </div>
      </div>

      <div class="caption-text">
        check caption for details
      </div>
    </div>

    <div class="poster-footer">
      @ULISOC
    </div>
  </article>
</body>
</html>
`;
}

export async function capturePoster(
  config,
  payload,
) {
  const outputDir = path.join(
    config.dataDir,
    "previews",
  );

  await fs.mkdir(outputDir, {
    recursive: true,
    mode: 0o700,
  });

  const outputPath = path.join(
    outputDir,
    `jummah-${payload.date}.jpg`,
  );

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: config.chromePath,
    protocolTimeout: 240_000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1080,
      height: 1080,
      deviceScaleFactor: 1,
    });

    const testDate =
      process.env.LOCAL_TEST_DATE?.trim() ?? "";

    const localTest =
      process.env.ALLOW_TEST_SEND === "true" &&
      /^\d{4}-\d{2}-\d{2}$/.test(testDate);

    if (localTest) {
      const logoPath = path.resolve(
        workerDir,
        "../../public/assets/ulisoc-logo-red.png",
      );

      const logoBytes =
        await fs.readFile(logoPath);

      const logoDataUrl =
        "data:image/png;base64," +
        logoBytes.toString("base64");

      const html = createTestPosterHtml({
        dateValue: payload.date,
        logoDataUrl,
        apiBase: config.apiBase,
      });

      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: 60_000,
      });
    } else {
      await page.setExtraHTTPHeaders({
        authorization:
          `Bearer ${config.automationSecret}`,
      });

      const url = new URL(
        payload.posterPath,
        config.apiBase,
      );

      const response = await page.goto(
        url.href,
        {
          waitUntil: "networkidle0",
          timeout: 60_000,
        },
      );

      if (!response?.ok()) {
        throw new Error(
          `Poster page returned ${
            response?.status() ??
            "no response"
          }.`,
        );
      }
    }

    await page.waitForSelector(
      ".jummah-poster",
      {
        timeout: 20_000,
      },
    );

    await page.waitForFunction(
      () =>
        [...document.images].every(
          (image) =>
            image.complete &&
            image.naturalWidth > 0,
        ),
      {
        timeout: 20_000,
      },
    );

    await page.evaluate(
      () => document.fonts.ready,
    );

    await page.screenshot({
      path: outputPath,
      type: "jpeg",
      quality: 78,
      clip: {
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
      },
    });

    const details =
      await fs.stat(outputPath);

    console.log(
      `Compressed poster size: ${
        Math.round(details.size / 1024)
      } KB`,
    );

    return outputPath;
  } finally {
    await browser.close();
  }
}