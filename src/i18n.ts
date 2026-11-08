import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const routing = {
  locales: ["en", "vi", "ja"] as const,
  defaultLocale: "en" as const,
};

export type AppLocale = (typeof routing.locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Read NEXT_LOCALE cookie from request headers if present
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  let locale = cookieLocale || (await requestLocale);

  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
