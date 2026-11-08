import { ReactNode } from "react";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { Updater } from "./updater";
import { UIProvider } from "./ui-provider";

export interface ProvidersProps {
  children: ReactNode;
  messages: AbstractIntlMessages;
  locale: string;
}

/**
 * Root Providers component: Centralizes all application providers
 * (Internationalization, Lifecycle Updater, and Global UI Overlay).
 */
export function Providers({ children, messages, locale }: ProvidersProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Updater />
      <UIProvider>{children}</UIProvider>
    </NextIntlClientProvider>
  );
}

