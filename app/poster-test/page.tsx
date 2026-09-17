import { headers } from "next/headers";
import { hasEditorSession } from "@/lib/jummah-auth";
import { hasAutomationAccess } from "@/lib/jummah-automation";
import { getJummahForFriday } from "@/lib/jummah";
import { JummahPoster } from "@/components/jummah-poster";

export const dynamic = "force-dynamic";

type PosterSearchParams = Promise<{
  date?: string;
  fixture?: string;
}>;

export default async function AutomationPosterPage({
  searchParams,
}: {
  searchParams: PosterSearchParams;
}) {
  const {
    date = "",
    fixture = "",
  } = await searchParams;

  const requestHeaders = await headers();

  const hostname =
    requestHeaders
      .get("host")
      ?.split(":")[0]
      .toLowerCase() ?? "";

  const validDate =
    /^\d{4}-\d{2}-\d{2}$/.test(date);

  const localFixture =
    fixture === "1" &&
    validDate &&
    (
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    );

  const authorised =
    localFixture ||
    (await hasEditorSession()) ||
    (await hasAutomationAccess(requestHeaders));

  if (!authorised) {
    return <PlainStatus message="Not authorised" />;
  }

  if (localFixture) {
    return (
      <JummahPoster
        schedule={{ fridayDate: date }}
      />
    );
  }

  const schedule =
    await getJummahForFriday(date);

  if (!schedule) {
    return (
      <PlainStatus
        message={
          "No published Jumu'ah poster exists " +
          "for this Friday."
        }
      />
    );
  }

  return <JummahPoster schedule={schedule} />;
}

function PlainStatus({
  message,
}: {
  message: string;
}) {
  return (
    <main
      style={{
        width: 1080,
        height: 1080,
        display: "grid",
        placeItems: "center",
        background: "#090808",
        color: "#fff",
        font: "700 34px Arial",
        textAlign: "center",
        padding: 80,
      }}
    >
      {message}
    </main>
  );
}