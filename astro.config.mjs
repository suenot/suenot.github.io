import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.suenot.com',
  integrations: [tailwind(), sitemap()],
  markdown: {
    shikiConfig: {
      // Dark stays inline (the default theme, also with JS off); light ships as
      // --shiki-light variables that global.css applies under [data-theme='light'].
      themes: { dark: 'github-dark', light: 'github-light' },
      defaultColor: 'dark',
    },
  },
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [
      {
        name: 'html-charset',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (res.headersSent) return next();
            const originalSetHeader = res.setHeader.bind(res);
            res.setHeader = function (name, value) {
              if (name.toLowerCase() === 'content-type' && typeof value === 'string' && value.includes('text/html')) {
                return originalSetHeader(name, value + '; charset=utf-8');
              }
              return originalSetHeader(name, value);
            };
            next();
          });
        },
      },
    ],
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'zh', 'ko', 'ja', 'ar'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
});
