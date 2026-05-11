import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared schema for both languages. translationKey links posts that are
// translations of each other; it's optional so posts can be language-only.
const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  // Links translations of the same post across languages.
  // Set the same value in the EN and ES frontmatter when they're translations.
  translationKey: z.string().optional(),
  // Reading time / cover images / etc can be added later as needed.
  cover: z.string().optional(),
});

const en = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/en' }),
  schema: postSchema,
});

const es = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/es' }),
  schema: postSchema,
});

export const collections = { en, es };
