import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { siteConfig } from '../../site.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const fontsDir = join(__dirname, 'fonts');
const outDir = join(root, 'public', 'og');
const blogDir = join(root, 'src', 'content', 'blog');

const FONT_SOURCES = {
  'NotoSansSC-Regular.otf':
    'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf',
  'NotoSansSC-Bold.otf':
    'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Bold.otf',
};

async function downloadFont(name, url, target) {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(attempt > 1 ? `[og] downloading ${name} (attempt ${attempt}/3)` : `[og] downloading ${name}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      // 完整性校验：Noto 中文字体超 8MB，若明显偏小则判定为残缺下载
      if (buf.length < 1_000_000) throw new Error(`suspicious small file (${buf.length} bytes)`);
      await writeFile(target, buf);
      return;
    } catch (err) {
      lastErr = err;
      console.warn(`[og] download failed ${name}: ${err.message}` + (attempt < 3 ? ', retrying...' : ''));
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function ensureFonts() {
  await mkdir(fontsDir, { recursive: true });
  for (const [name, url] of Object.entries(FONT_SOURCES)) {
    const target = join(fontsDir, name);
    try {
      await access(target);
    } catch {
      await downloadFont(name, url, target);
    }
  }
  return {
    regular: await readFile(join(fontsDir, 'NotoSansSC-Regular.otf')),
    bold: await readFile(join(fontsDir, 'NotoSansSC-Bold.otf')),
  };
}

async function listPosts() {
  const out = [];
  for (const locale of ['zh-cn', 'en']) {
    const dir = join(blogDir, locale);
    let files;
    try {
      files = await readdir(dir);
    } catch {
      continue;
    }
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const raw = await readFile(join(dir, file), 'utf8');
      const { data } = matter(raw);
      out.push({
        locale,
        slug: file.replace(/\.md$/, ''),
        translationKey: data.translationKey,
        title: data.title,
        description: data.description,
        date: data.date,
        cover: data.cover,
      });
    }
  }
  return out;
}

function template({ title, description, kicker, dateLabel }) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: 'linear-gradient(135deg, #f3f7ff 0%, #e6efff 60%, #d9e6ff 100%)',
        fontFamily: 'NotoSansSC',
        color: '#0a2540',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '16px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '14px',
                    height: '14px',
                    borderRadius: '999px',
                    background: '#1a73e8',
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '28px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    color: '#0a2540',
                  },
                  children: kicker,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '28px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '64px',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: '#0a2540',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '28px',
                    fontWeight: 400,
                    lineHeight: 1.45,
                    color: '#3a4a63',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  },
                  children: description,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '24px',
              color: '#5b6b85',
              fontWeight: 400,
            },
            children: [
              { type: 'div', props: { children: siteConfig.site.replace(/^https?:\/\//, '') + (siteConfig.base === '/' ? '' : siteConfig.base) } },
              { type: 'div', props: { children: dateLabel } },
            ],
          },
        },
      ],
    },
  };
}

async function renderToPng(node, fonts) {
  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'NotoSansSC', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'NotoSansSC', data: fonts.bold, weight: 700, style: 'normal' },
    ],
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    background: 'rgba(255,255,255,1)',
  });
  return resvg.render().asPng();
}

function formatDate(d, locale) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.valueOf())) return '';
  if (locale === 'zh-cn') {
    return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

async function main() {
  const fonts = await ensureFonts();
  await mkdir(outDir, { recursive: true });

  const posts = await listPosts();

  const generated = new Set();
  for (const post of posts) {
    if (post.cover) {
      console.log(`[og] skip ${post.locale}/${post.slug} (custom cover)`);
      continue;
    }
    const key = `${post.locale}/${post.translationKey || post.slug}`;
    if (generated.has(key)) continue;
    generated.add(key);

    const node = template({
      kicker: post.locale === 'zh-cn' ? `${siteConfig.name} · 博客` : `${siteConfig.name} · blog`,
      title: post.title,
      description: post.description,
      dateLabel: formatDate(post.date, post.locale),
    });
    const png = await renderToPng(node, fonts);
    const outPath = join(outDir, post.locale, `${post.translationKey || post.slug}.png`);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, png);
    console.log(`[og] wrote ${outPath}`);
  }

  // site default
  const defaultNode = template({
    kicker: `${siteConfig.name}`,
    title: siteConfig.name,
    description: 'Personal site & blog',
    dateLabel: '',
  });
  const defaultPng = await renderToPng(defaultNode, fonts);
  await writeFile(join(outDir, 'default.png'), defaultPng);
  console.log(`[og] wrote ${join(outDir, 'default.png')}`);
}

main().catch((err) => {
  console.error('[og] generation failed:', err);
  process.exit(1);
});
