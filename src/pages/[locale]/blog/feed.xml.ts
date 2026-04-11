import type { APIContext, GetStaticPaths } from 'astro';
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { locales, type Locale } from '../../../i18n/config';
import { useTranslations } from '../../../i18n/ui';

export const getStaticPaths = (() => {
  return locales.map((locale) => ({ params: { locale } }));
}) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const locale = context.params.locale as Locale;
  const t = useTranslations(locale);

  const posts = await getCollection('blog', ({ id, data }) => {
    return id.startsWith(`${locale}/`) && !data.draft;
  });

  const sortedPosts = posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  return rss({
    title: `${t('blog.title')} — Eugen Soloviov`,
    description: t('blog.description'),
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/${locale}/blog/${post.id.replace(`${locale}/`, '').replace(/\.md$/, '')}/`,
      categories: post.data.tags,
    })),
    customData: `<language>${locale}</language>`,
  });
}
