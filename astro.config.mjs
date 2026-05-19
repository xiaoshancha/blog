// @ts-check
import { defineConfig } from 'astro/config';
import { siteConfig } from './site.config.mjs';

// https://astro.build/config
export default defineConfig({
  site: siteConfig.site,
  base: siteConfig.base,
  i18n: {
    locales: siteConfig.locales,
    defaultLocale: siteConfig.defaultLocale,
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
