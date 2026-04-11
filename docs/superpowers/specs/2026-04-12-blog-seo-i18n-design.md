# Blog with SEO & Multilingual Support — Design Spec

**Date:** 2026-04-12
**Status:** Approved
**Approach:** Astro Content Collections

## Context

Add a blog to an existing Astro 4.15 portfolio site (Tailwind CSS, dark theme, deployed to GitHub Pages). The blog must be SEO-optimized and support 6 languages with RTL for Arabic.

## Requirements

### Languages (6)
- **English** (`en`) — default
- **Russian** (`ru`)
- **Chinese** (`zh`)
- **Korean** (`ko`)
- **Japanese** (`ja`)
- **Arabic** (`ar`) — RTL

### Content Storage
Markdown files in `src/content/blog/<locale>/`. One file per post per language. Same filename = translation of same post.

### Frontmatter Schema (Zod)
```yaml
title: string          # required
description: string    # required, for SEO
pubDate: Date          # required
updatedDate?: Date     # optional
heroImage?: string     # optional, path in /public
tags: string[]         # required
draft?: boolean        # default false
```

## Architecture

### Routing
```
/                        → redirect to /en/ (or browser language)
/[locale]/               → localized portfolio
/[locale]/blog/           → post list (paginated, 10 per page)
/[locale]/blog/[slug]/    → individual post
/[locale]/blog/tags/      → all tags
/[locale]/blog/tags/[tag] → posts by tag
```

### File Structure (new/modified)
```
src/
  content/
    config.ts                          # Zod schema for blog collection
    blog/{en,ru,zh,ko,ja,ar}/         # Markdown posts
  i18n/
    config.ts                          # locales, defaultLocale, localeNames
    ui.ts                              # UI translations (buttons, labels, headings)
    utils.ts                           # getLangFromUrl(), getLocalizedPath()
  layouts/
    Layout.astro                       # +lang, +dir, +SEO meta, +hreflang
    BlogPost.astro                     # post layout (TOC, markdown styles)
  components/
    Nav.astro                          # +LanguageSelector
    LanguageSelector.astro             # dropdown language picker
    BlogCard.astro                     # post card
    TagList.astro                      # tag chips
    Search.astro                       # client-side search
    TableOfContents.astro              # heading navigation
    TranslationLinks.astro             # links to translations
  pages/
    index.astro                        # → redirect to /en/
    [locale]/
      index.astro                      # localized portfolio
      blog/
        index.astro                    # post list
        [slug].astro                   # post page
        tags/
          index.astro                  # all tags
          [tag].astro                  # posts by tag
        feed.xml.ts                    # RSS feed per locale
astro.config.mjs                       # +sitemap integration
public/
  robots.txt
tailwind.config.mjs                    # +RTL support
```

### i18n Configuration
```typescript
// src/i18n/config.ts
export const defaultLocale = 'en';
export const locales = ['en', 'ru', 'zh', 'ko', 'ja', 'ar'] as const;
export type Locale = typeof locales[number];

export const rtlLocales: Locale[] = ['ar'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
  ar: 'العربية',
};
```

### Language Selector
Dropdown in Nav. Shows current language name in native script. On switch — navigate to same URL path with different locale. If post translation missing — fallback to English.

### RTL Support
Arabic pages render with `dir="rtl"` and `lang="ar"` on `<html>`. Tailwind `rtl:` prefix for directional overrides.

## SEO

### Structured Data (JSON-LD)
- `BlogPosting` on each post page (title, description, datePublished, dateModified, author, image, keywords)
- `Blog` on post list page
- `BreadcrumbList` on all blog pages (Home > Blog > Post Title)
- `WebSite` with `SearchAction` on homepage

### Meta Tags (every page)
- `<title>` — localized
- `<meta name="description">` — from frontmatter
- `<link rel="canonical">` — absolute URL
- `<link rel="alternate" hreflang="...">` — all 6 locales + `x-default`
- Open Graph: og:title, og:description, og:image, og:type, og:locale, og:url
- Twitter Cards: twitter:card, twitter:title, twitter:description, twitter:image

### Sitemap & RSS
- `@astrojs/sitemap` — auto-generated sitemap-index.xml with hreflang entries
- RSS feed per locale at `/[locale]/blog/feed.xml`

### Additional
- `<html lang="xx">` on every page
- `robots.txt` allowing all, pointing to sitemap
- `noindex` meta for draft posts

## Blog Pages

### Post List (`/[locale]/blog/`)
- Card grid: 2-3 columns desktop, 1 mobile
- Card: heroImage + title + description + date + tags
- Tag filter chips at top
- Client-side search by titles and descriptions
- Pagination (10 posts per page)

### Post Page (`/[locale]/blog/[slug]/`)
- Hero image (full width, if present)
- Title + date + tags
- Markdown body rendered by Astro
- Translation links to other languages
- "Back to blog" navigation
- Auto-generated Table of Contents from headings

### Tag Page (`/[locale]/blog/tags/[tag]/`)
- Tag heading + post count
- Same card grid, filtered by tag

## New Dependencies
- `@astrojs/sitemap` — sitemap generation
- `@astrojs/rss` — RSS feeds
- Custom `SEO.astro` component — meta tags (no external package)

## Design Consistency
- Dark theme matching existing portfolio
- Colors: surface `#0F0F1A`, surface-2 `#1A1A2E`, accent `#7C3AED`
- System font stacks (existing)
- Same hover effects and card styles

## Implementation Order
1. i18n config and utilities
2. Content Collections (Zod schema + demo posts)
3. Layout + SEO component (meta, hreflang, JSON-LD)
4. Blog pages (list → post → tags)
5. LanguageSelector + Nav adaptation
6. Portfolio migration to `[locale]/index.astro`
7. Client-side search
8. Sitemap + RSS
9. Demo content in all 6 languages

## Out of Scope (YAGNI)
- Authentication / CMS
- Comments system
- Analytics
- Infinite scroll pagination
- Newsletter subscription
