import { siteConfig as sharedSiteConfig } from '../site.config.mjs';

export const siteConfig = sharedSiteConfig as unknown as {
  name: string;
  site: string;
  base: string;
  defaultLocale: 'zh-cn';
  locales: readonly ['zh-cn', 'en'];
  githubRepo: string;
  githubProfile: string;
  giscus: {
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    reactionsEnabled: string;
    emitMetadata: string;
    inputPosition: string;
    theme: string;
  };
};

export type SiteLocale = (typeof siteConfig.locales)[number];
