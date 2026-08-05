import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';

type PostEntry = CollectionEntry<'posts'>;

/**
 * Returns all non-draft posts in a given language, sorted newest-first.
 */
export async function getPosts(lang: Lang): Promise<PostEntry[]> {
  const posts = await getCollection('posts', ({ data }) => data.lang === lang && !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Returns every non-draft post across all languages, sorted newest-first.
 * Tags are language-agnostic, so anything that aggregates them reads from here.
 */
export async function getAllPosts(): Promise<PostEntry[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
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

/**
 * Build a map of translationKey -> href for the OTHER language.
 * Used to render translation links and hreflang alternates.
 */
export async function getTranslationMap(currentLang: Lang): Promise<Map<string, string>> {
  const otherLang: Lang = currentLang === 'en' ? 'es' : 'en';
  const otherPosts = await getCollection('posts', ({ data }) => data.lang === otherLang && !data.draft);
  const map = new Map<string, string>();
  for (const post of otherPosts) {
    if (post.data.translationKey) {
      map.set(post.data.translationKey, `/${otherLang}/posts/${post.id}`);
    }
  }
  return map;
}

/**
 * Convenience: resolve a translation href for a single post.
 */
export async function getTranslationHref(
  post: PostEntry,
  lang: Lang
): Promise<string | undefined> {
  if (!post.data.translationKey) return undefined;
  const map = await getTranslationMap(lang);
  return map.get(post.data.translationKey);
}
