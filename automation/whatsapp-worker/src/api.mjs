export async function fetchJummah(config) {
  const testDate =
    process.env.LOCAL_TEST_DATE?.trim() ?? "";

  const safeTestGroupId =
    process.env.SAFE_TEST_GROUP_ID?.trim() ?? "";

  const controlledTestSend =
    process.env.ALLOW_TEST_SEND === "true" &&
    safeTestGroupId.length > 0 &&
    config.targetGroupId === safeTestGroupId &&
    config.schedulerEnabled === false;

  if (
    controlledTestSend &&
    /^\d{4}-\d{2}-\d{2}$/.test(testDate)
  ) {
    console.log(
      `LOCAL TEST MODE: using fixture ${testDate}.`,
    );

    return {
      date: testDate,
      sendable: true,
      posterPath:
        `/automation/poster?fixture=1&date=` +
        encodeURIComponent(testDate),
      caption:
        "⚠️ AUTOMATION TEST — NOT A CURRENT ANNOUNCEMENT\n\n" +
        "This is a controlled test of the ULISOC automated " +
        "Jumu'ah poster and caption system.\n\n" +
        `Fixture date: ${testDate}\n\n` +
        "Please ignore the date and arrangements shown.",
    };
  }

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    15_000,
  );

  try {
    const response = await fetch(
      `${config.apiBase}/api/automation/jummah`,
      {
        headers: {
          authorization:
            `Bearer ${config.automationSecret}`,
          accept: "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );

    const body = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "The website rejected " +
              "ULISOC_AUTOMATION_SECRET."
          : `Jumu'ah API returned ${response.status}.`,
      );
    }

    if (
      !body ||
      typeof body.date !== "string" ||
      typeof body.sendable !== "boolean"
    ) {
      throw new Error(
        "The website returned an invalid " +
          "Jumu'ah payload.",
      );
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}