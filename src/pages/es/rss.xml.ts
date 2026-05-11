import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('es', ({ data }: CollectionEntry<'es'>) => !data.draft);
  return rss({
    title: 'Miguel Valdes — blog (ES)',
    description: 'Un taller para los curiosos. Ingeniería de software, automatización, observabilidad y self-hosting.',
    site: context.site!,
    items: posts
      .sort((a: CollectionEntry<'es'>, b: CollectionEntry<'es'>) =>
        b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
      )
      .map((post: CollectionEntry<'es'>) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/es/posts/${post.id}`,
        categories: post.data.tags,
      })),
    customData: '<language>es-es</language>',
  });
}
