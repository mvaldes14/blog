import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';

// Update SITE to your final domain when you're ready to cut over from blog.mvaldes.dev.
export default defineConfig({
  site: 'https://blog.mvaldes.dev',
  trailingSlash: 'never',
  server: {
    host: '0.0.0.0',
  },
  integrations: [
    mdx(),
    sitemap(),
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
