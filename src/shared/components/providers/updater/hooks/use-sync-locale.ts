'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { cookieUtils } from '@/shared/utils/cookie';

const LOCALE_KEY = 'ezgame_locale';

export function useSyncLocale() {
  const currentLocale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const changeLocale = useCallback(
    (newLocale: string) => {
      try {
        localStorage.setItem(LOCALE_KEY, newLocale);
        cookieUtils.set('NEXT_LOCALE', newLocale);
      } catch {
        // Ignore
      }
      startTransition(() => {
        router.refresh();
      });
    },
    [router],
  );

  return {
    currentLocale,
    changeLocale,
  };
}
