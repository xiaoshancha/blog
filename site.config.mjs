// 部署平台检测：Cloudflare Pages 构建时自动注入 CF_PAGES=1 与 CF_PAGES_URL
// （GitHub Pages 走 .github/workflows/deploy.yml，无这些变量）
const deployPlatform = process.env.CF_PAGES === '1' ? 'cloudflare' : 'github';
const cloudflareSite =
  process.env.PUBLIC_SITE_URL || // 绑定了自定义域名时，在 Pages 环境变量里覆盖此值
  process.env.CF_PAGES_URL ||
  'https://blog.pages.dev';

export const siteConfig = {
  name: 'xiaoshancha',
  // Cloudflare Pages 站点在根路径；GitHub Pages 位于仓库子路径 /blog
  site: deployPlatform === 'cloudflare' ? cloudflareSite : 'https://xiaoshancha.github.io',
  base: deployPlatform === 'cloudflare' ? '/' : '/blog',
  defaultLocale: 'zh-cn',
  locales: ['zh-cn', 'en'],
  githubRepo: 'xiaoshancha/blog',
  githubProfile: 'https://github.com/xiaoshancha',
  footerChannels: [
    {
      key: 'wechat',
      label: '微信 / 电话',
      value: '15040021229',
      href: 'tel:15040021229',
    },
    {
      key: 'douyin',
      label: '抖音',
      value: 'Whycue',
    },
    {
      key: 'email',
      label: '邮箱',
      value: '1337630175@qq.com',
      href: 'mailto:1337630175@qq.com',
    },
  ],
  giscus: {
    repo: 'xiaoshancha/blog',
    repoId: '',
    category: 'General',
    categoryId: '',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top',
    theme: 'preferred_color_scheme',
  },
};
