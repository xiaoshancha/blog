import { getCollection, type CollectionEntry } from 'astro:content';
import type { SiteLocale } from '../site.config';
import { locales } from '../i18n/config';

export type BlogEntry = CollectionEntry<'blog'>;
export type ProfileEntry = CollectionEntry<'profile'>;

export function localeFromId(id: string): SiteLocale {
  const segment = id.split('/')[0]?.replace(/\.md$/, '');
  if (locales.includes(segment as SiteLocale)) {
    return segment as SiteLocale;
  }

  throw new Error(`Unsupported locale segment "${segment}" in content id "${id}".`);
}

export function slugFromId(id: string) {
  return id.split('/').pop()?.replace(/\.md$/, '') ?? id;
}

function validateTranslationKeys(posts: BlogEntry[]) {
  const seen = new Set<string>();

  for (const post of posts) {
    const locale = localeFromId(post.id);
    const composite = `${locale}:${post.data.translationKey}`;

    if (seen.has(composite)) {
      throw new Error(
        `Duplicate translationKey "${post.data.translationKey}" found for locale "${locale}".`,
      );
    }

    seen.add(composite);
  }
}

async function getAllBlogPosts() {
  const posts = await getCollection('blog');
  validateTranslationKeys(posts);
  return posts;
}

async function getAllProfiles() {
  const profiles = await getCollection('profile');
  const seen = new Set<SiteLocale>();

  for (const profile of profiles) {
    const locale = localeFromId(profile.id);
    if (seen.has(locale)) {
      throw new Error(`Duplicate profile content found for locale "${locale}".`);
    }

    seen.add(locale);
  }

  return profiles;
}

export async function getPostsByLocale(locale: SiteLocale) {
  const posts = await getAllBlogPosts();

  return posts
    .filter((entry) => localeFromId(entry.id) === locale)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getTranslatedPost(
  entry: BlogEntry,
  targetLocale: SiteLocale,
) {
  const posts = await getPostsByLocale(targetLocale);
  const matches = posts.filter(
    (candidate) => candidate.data.translationKey === entry.data.translationKey,
  );

  if (matches.length > 1) {
    throw new Error(
      `Duplicate translationKey "${entry.data.translationKey}" found for locale "${targetLocale}".`,
    );
  }

  return matches[0];
}

export async function getProfile(locale: SiteLocale) {
  const profiles = await getAllProfiles();
  return profiles.find((entry) => localeFromId(entry.id) === locale);
}
