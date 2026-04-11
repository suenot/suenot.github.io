import { defaultLocale, locales, type Locale } from './config';

export function getLangFromUrl(url: URL): Locale {
  const [, locale] = url.pathname.split('/');
  if (locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return defaultLocale;
}

export function getLocalizedPath(path: string, locale: Locale): string {
  return `/${locale}${path}`;
}

export function getStaticLocalePaths() {
  return locales.map((locale) => ({ params: { locale } }));
}
