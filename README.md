# xiaoshancha / Personal Site

An Astro-based bilingual personal site and blog for `xiaoshancha/blog`.

## Stack

- Astro
- Markdown content collections
- GitHub Pages
- Optional Giscus comments on post pages

## Local development

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Content structure

- Chinese homepage/profile content: `src/content/profile/zh-cn.md`
- English homepage/profile content: `src/content/profile/en.md`
- Chinese posts: `src/content/blog/zh-cn/`
- English posts: `src/content/blog/en/`

Each translated post must share the same `translationKey`.

Owner-facing content entry page:

- Chinese: `/blog/setup/`
- English: `/blog/en/setup/`

## Route contract

- `/blog/` -> default locale (`zh-cn`) homepage
- `/blog/posts/` -> default locale posts
- `/blog/en/` -> English homepage
- `/blog/en/posts/` -> English posts

## Giscus setup

Comments are isolated to post pages and keyed by `translationKey`, so translated variants can share one discussion thread.

To enable Giscus:

1. Enable GitHub Discussions on `xiaoshancha/blog`
2. Install the Giscus app for the repository
3. Generate `repoId` and `categoryId` in the Giscus setup UI
4. Fill `repoId` and `categoryId` in `site.config.mjs`

Until that configuration exists, the post page shows a setup note instead of a live discussion widget.

## GitHub Pages deployment

This repository currently publishes through GitHub Pages legacy branch mode from `master:/`.

That means the built static output is committed at the repository root alongside the Astro source tree. The source of truth for editing remains the Astro project, and the published files are refreshed by running a local build before pushing.

Typical publish flow:

```bash
npm run build
cp -R dist/. .
git add -A
git commit -m "..."
git push origin master
```

If workflow-capable GitHub credentials become available later, this repo can be upgraded back to a `GitHub Actions` deployment model.
