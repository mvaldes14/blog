import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('published'),
  // Keep `es` valid so Spanish drafts can live in the collection, but only English routes build today.
  lang: z.enum(['en', 'es']),
  cover: z.string().optional(),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: postSchema,
});

export const collections = { posts };
