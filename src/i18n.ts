export type Lang = 'en';

export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'nav.writing': 'writing',
    'nav.video': 'video',
    'nav.projects': 'projects',
    'nav.about': 'about',
    'hero.eyebrow': 'Now writing',
    'hero.headline': 'A workshop for the',
    'hero.headline.em': 'curious',
    'hero.headline.tail': '.',
    'hero.subhead': '',
    'hero.lede':
      "Hello. This is more than just a blog — it's a log of my journey through software engineering, automation, observability, and self-hosting. I write about what I'm learning, building, and occasionally breaking.",
    'meta.role': 'role',
    'meta.stack': 'stack',
    'meta.infra': 'infra',
    'meta.contact': 'contact',
    'meta.writes': 'writes',
    'meta.location': 'location',
    'meta.homelab': 'homelab',
    'meta.lastBuild': 'last build',
    'section.latest': 'Latest writing',
    'section.about': 'About',
    'section.video': 'Latest video',
    'section.topics': 'Topics',
    'post.posts': 'posts',
    'post.minRead': 'min read',
    'footer.builtWith': 'Astro <> Obsidian',
    'page.prev': '← newer',
    'page.next': 'older →',
    'page.of': 'of',
  },
} as const;

export function t(_lang: Lang, key: keyof typeof ui.en): string {
  return ui.en[key];
}

export function formatDate(date: Date, _lang: Lang): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}
