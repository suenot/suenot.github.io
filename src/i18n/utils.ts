import { defaultLocale, locales, type Locale } from './config';

export function getLangFromUrl(url: URL): Locale {
  const [, locale] = url.pathname.split('/');
  if (locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return defaultLocale;
}

/**
 * Returns the URL prefix for a locale.
 * Default locale (en) → '' (no prefix, served at root)
 * Other locales → '/ru', '/zh', etc.
 */
export function getLocalePrefix(locale: Locale): string {
  return locale === defaultLocale ? '' : `/${locale}`;
}

export function getLocalizedPath(path: string, locale: Locale): string {
  return `${getLocalePrefix(locale)}${path}`;
}

export function getStaticLocalePaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

/** Project years, not translated: [start], [start, end] or [start, 'now']. */
export type Years = readonly [number] | readonly [number, number | 'now'];

export function formatYears(years: Years, presentLabel: string): string {
  const [start, end] = years;
  if (end === undefined || end === start) return String(start);
  return `${start}\u2013${end === 'now' ? presentLabel : end}`;
}
