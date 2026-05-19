export const siteConfig = {
  name: 'xiaoshancha',
  site: 'https://xiaoshancha.github.io',
  base: '/blog',
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
