'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { cookieUtils } from '@/shared/utils/cookie';

const LOCALE_KEY = 'ezgame_locale';

export function useSyncLocale() {
  const [currentLocale, setCurrentLocale] = useState<string>('en');
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_KEY) || cookieUtils.get('NEXT_LOCALE');
      if (stored) {
        setCurrentLocale(stored);
        cookieUtils.set('NEXT_LOCALE', stored);
      }
    } catch {
      // LocalStorage access may be restricted
    }
  }, []);

  const changeLocale = useCallback(
    (newLocale: string) => {
      try {
        localStorage.setItem(LOCALE_KEY, newLocale);
        cookieUtils.set('NEXT_LOCALE', newLocale);
      } catch {
        // Ignore
      }
      setCurrentLocale(newLocale);
      // Soft-refresh the current route through Next.js App Router (zero page flicker)
      router.refresh();
    },
    [router],
  );

  return {
    currentLocale,
    changeLocale,
  };
}
