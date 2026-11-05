import { ReactNode } from "react";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

interface ProvidersProps {
  children: ReactNode;
  messages: AbstractIntlMessages;
  locale: string;
}

export function Providers({ children, messages, locale }: ProvidersProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
