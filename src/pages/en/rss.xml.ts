import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }: CollectionEntry<'posts'>) => data.lang === 'en' && !data.draft);
  return rss({
    title: 'Miguel Valdes — blog (EN)',
    description: 'A workshop for the curious. Software engineering, automation, observability, and self-hosting.',
    site: context.site!,
    items: posts
      .sort((a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>) =>
        b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
      )
      .map((post: CollectionEntry<'posts'>) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/en/posts/${post.id}`,
        categories: post.data.tags,
      })),
    customData: '<language>en-us</language>',
  });
}
