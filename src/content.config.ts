import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const flexibleDate = z.preprocess((value) => {
  if (typeof value !== 'string') return value;

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return value;

  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}, z.coerce.date());

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: flexibleDate,
  updatedDate: flexibleDate.optional(),
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
