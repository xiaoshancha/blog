import { defaultLocale, locales } from '../i18n/config';
import { siteConfig } from '../site.config';
import type { SiteLocale } from '../site.config';

export function isLocale(value: string): value is SiteLocale {
  return locales.includes(value as SiteLocale);
}

export function normalizeLocale(value?: string | null): SiteLocale {
  return value && isLocale(value) ? value : defaultLocale;
}

function trimSlashes(pathname: string) {
  return pathname.replace(/^\/+|\/+$/g, '');
}

function basePrefix() {
  const base = trimSlashes(siteConfig.base);
  return base ? `/${base}` : '';
}

// 给静态资源路径加上 base 前缀，兼容 base = '/'（Cloudflare）与 '/blog'（GitHub Pages）
export function withBase(path: string) {
  const clean = trimSlashes(path);
  const prefix = basePrefix();
  if (!clean) return prefix ? `${prefix}/` : '/';
  return prefix ? `${prefix}/${clean}` : `/${clean}`;
}

export function localizedPath(locale: SiteLocale, pathname = '') {
  const clean = trimSlashes(pathname);
  const prefix = basePrefix();
  if (locale === defaultLocale) {
    return clean ? `${prefix}/${clean}/` : `${prefix ? `${prefix}/` : '/'}`;
  }

  const localeRoot = `${prefix}/${locale}`;
  return clean ? `${localeRoot}/${clean}/` : `${localeRoot}/`;
}

export function homePath(locale: SiteLocale) {
  return localizedPath(locale);
}

export function postsPath(locale: SiteLocale) {
  return localizedPath(locale, 'posts');
}

export function setupPath(locale: SiteLocale) {
  return localizedPath(locale, 'setup');
}

export function postPath(locale: SiteLocale, slug: string) {
  return localizedPath(locale, `posts/${slug}`);
}

export function notFoundPath() {
  return `${basePrefix() || ''}/404.html`;
}

export function alternateLocale(locale: SiteLocale): SiteLocale {
  return locale === 'zh-cn' ? 'en' : 'zh-cn';
}

export function formatLocaleDate(locale: SiteLocale, value: Date) {
  return new Intl.DateTimeFormat(locale === 'zh-cn' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(value);
}
