import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';

// Update SITE to your final domain when you're ready to cut over from blog.mvaldes.dev
// or whatever path you decide to use for the bilingual version.
export default defineConfig({
  site: 'https://blog.mvaldes.dev',
  trailingSlash: 'never',
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          es: 'es-ES',
        },
      },
    }),
  ],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      // 'one-dark-pro' and 'github-dark' are also good; this one matches the mock's vibe
      theme: 'github-dark-dimmed',
      wrap: false,
    },
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['heading-anchor'], ariaLabel: 'Link to section' },
          content: { type: 'text', value: ' #' },
        },
      ],
    ],
  },
});
