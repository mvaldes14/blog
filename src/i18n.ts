export const languages = {
  en: 'English',
  es: 'Español',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'nav.writing': 'writing',
    'nav.video': 'video',
    'nav.talks': 'talks',
    'nav.projects': 'projects',
    'nav.about': 'about',
    'hero.eyebrow': 'Now writing · ahora escribiendo',
    'hero.headline': 'A workshop for the',
    'hero.headline.em': 'curious',
    'hero.headline.tail': '.',
    'hero.subhead': 'Un taller para los curiosos.',
    'hero.lede':
      "Hello, hola. This is more than just a blog — it's a log of my journey through software engineering, automation, observability, and self-hosting. I write in English and Spanish about what I'm learning, building, and occasionally breaking.",
    'meta.role': 'role',
    'meta.stack': 'stack',
    'meta.writes': 'writes',
    'meta.location': 'location',
    'meta.homelab': 'homelab',
    'meta.lastBuild': 'last build',
    'section.latest': 'Latest writing',
    'section.about': 'About',
    'section.video': 'Latest video',
    'section.topics': 'Topics',
    'post.readTranslation': 'leer en español',
    'post.posts': 'posts',
    'post.minRead': 'min read',
    'footer.builtWith': 'Astro <> Obsidian',
    'lang.other': 'ES',
    'lang.otherLong': 'Leer en español',
    'page.prev': '← newer',
    'page.next': 'older →',
    'page.of': 'of',
  },
  es: {
    'nav.writing': 'escritura',
    'nav.video': 'video',
    'nav.talks': 'charlas',
    'nav.projects': 'proyectos',
    'nav.about': 'sobre mí',
    'hero.eyebrow': 'Ahora escribiendo · now writing',
    'hero.headline': 'Un taller para los',
    'hero.headline.em': 'curiosos',
    'hero.headline.tail': '.',
    'hero.subhead': 'A workshop for the curious.',
    'hero.lede':
      'Hola, hello. Esto es más que un blog — es un registro de mi camino por la ingeniería de software, la automatización, la observabilidad y el self-hosting. Escribo en español e inglés sobre lo que estoy aprendiendo, construyendo y a veces rompiendo.',
    'meta.role': 'rol',
    'meta.stack': 'stack',
    'meta.writes': 'escribe',
    'meta.location': 'ubicación',
    'meta.homelab': 'homelab',
    'meta.lastBuild': 'último build',
    'section.latest': 'Últimas publicaciones',
    'section.about': 'Sobre mí',
    'section.video': 'Último video',
    'section.topics': 'Temas',
    'post.readTranslation': 'read in english',
    'post.posts': 'publicaciones',
    'post.minRead': 'min de lectura',
    'footer.builtWith': 'hecho con Astro · escrito en Obsidian',
    'lang.other': 'EN',
    'lang.otherLong': 'Read in English',
    'page.prev': '← recientes',
    'page.next': 'anteriores →',
    'page.of': 'de',
  },
} as const;

export function t(lang: Lang, key: keyof typeof ui.en): string {
  return ui[lang]?.[key] ?? ui[defaultLang][key];
}

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'es' : 'en';
}

export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}
