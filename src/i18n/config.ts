import en from './en';
import zhCN from './zh-cn';
import { siteConfig, type SiteLocale } from '../site.config';

type Dictionary = { [K in keyof typeof zhCN]: string };

export const locales = siteConfig.locales;
export const defaultLocale = siteConfig.defaultLocale;

export const dictionaries: Record<SiteLocale, Dictionary> = {
  'zh-cn': zhCN,
  en,
};

export function getDictionary(locale: SiteLocale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
