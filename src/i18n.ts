import { getRequestConfig } from "next-intl/server";

export const routing = {
  locales: ["en", "vi"] as const,
  defaultLocale: "en" as const,
};

export type AppLocale = (typeof routing.locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
