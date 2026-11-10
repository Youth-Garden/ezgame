import { ReactNode } from "react";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { Updater } from "./updater";
import { UIProvider } from "./ui-provider";
import { ThemeProvider, type ThemeMode } from "./updater/hooks/use-sync-theme";

export interface ProvidersProps {
  children: ReactNode;
  messages: AbstractIntlMessages;
  locale: string;
  initialTheme?: ThemeMode;
}

/**
 * Root Providers component: Centralizes all application providers
 * (Theme, Internationalization, Lifecycle Updater, and Global UI Overlay).
 */
export function Providers({ children, messages, locale, initialTheme = "dark" }: ProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <Updater />
        <UIProvider>{children}</UIProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
