export const defaultLocale = 'en';

export const locales = ['en', 'ru', 'zh', 'ko', 'ja', 'ar'] as const;

export type Locale = (typeof locales)[number];

export const rtlLocales: Locale[] = ['ar'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
  ar: 'العربية',
};

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
