import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';

type PostEntry = CollectionEntry<'posts'>;

/**
 * Returns all published English posts, sorted newest-first.
 */
export async function getPosts(_lang: Lang = 'en'): Promise<PostEntry[]> {
  const posts = await getCollection('posts', ({ data }) => data.lang === 'en' && data.status === 'published');
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Returns every published English post, sorted newest-first.
 */
export async function getAllPosts(): Promise<PostEntry[]> {
  return getPosts('en');
}

/**
 * Tags ranked by how many posts carry them, most-used first.
 * Ties break toward the tag on the most recent post, since `posts` arrives
 * newest-first and both Map iteration and Array.sort preserve that order.
 */
export function topTags(posts: PostEntry[], limit: number): [string, number][] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}
