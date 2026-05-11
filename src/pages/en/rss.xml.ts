import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('en', ({ data }: CollectionEntry<'en'>) => !data.draft);
  return rss({
    title: 'Miguel Valdes — blog (EN)',
    description: 'A workshop for the curious. Software engineering, automation, observability, and self-hosting.',
    site: context.site!,
    items: posts
      .sort((a: CollectionEntry<'en'>, b: CollectionEntry<'en'>) =>
        b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
      )
      .map((post: CollectionEntry<'en'>) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/en/posts/${post.id}`,
        categories: post.data.tags,
      })),
    customData: '<language>en-us</language>',
  });
}
