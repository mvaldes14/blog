import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';

type PostEntry = CollectionEntry<'en'> | CollectionEntry<'es'>;

/**
 * Returns all non-draft posts in a given language, sorted newest-first.
 */
export async function getPosts(lang: Lang): Promise<PostEntry[]> {
  const posts = await getCollection(lang, ({ data }: PostEntry) => !data.draft);
  return posts.sort(
    (a: PostEntry, b: PostEntry) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

/**
 * Build a map of translationKey -> href for the OTHER language.
 * Used to render translation links and hreflang alternates.
 */
export async function getTranslationMap(currentLang: Lang): Promise<Map<string, string>> {
  const otherLang: Lang = currentLang === 'en' ? 'es' : 'en';
  const otherPosts = await getCollection(otherLang, ({ data }: PostEntry) => !data.draft);
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
