import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://suenot.github.io',
  integrations: [tailwind(), sitemap()],
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
      prefixDefaultLocale: true,
    },
  },
});
