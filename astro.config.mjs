import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://suenot.github.io',
  integrations: [tailwind(), sitemap()],
  build: {
    inlineStylesheets: 'always',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'zh', 'ko', 'ja', 'ar'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
