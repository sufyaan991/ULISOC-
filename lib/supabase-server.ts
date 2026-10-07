import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase Auth is only called from the site's own route handlers, so no
// Supabase keys or requests reach the browser.
export async function createSupabaseServerClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be configured.");
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: items => {
        for (const { name, value, options } of items) cookieStore.set(name, value, options);
      },
    },
  });
}
