# OAuth 认证代理部署说明

用于给 `/admin`（Sveltia CMS，GitHub 后端）提供第 3 方 OAuth 认证。协议与 Decap/Sveltia CMS 完全兼容。

## 架构

```
浏览器 /admin ──弹窗──► /auth ──302──► github.com 授权页
                                        │ 用户授权
                                        ▼
                 /callback?code=... ◄───┘ (GitHub 回调)
                        │ 用 code 换 access_token
                        ▼
                 postMessage 回传给 CMS，登录完成
```

- **静态站点**（`blog.baimuyuan.online` / `blog.1337630175.workers.dev`）：托管页面，含 `/admin`
- **OAuth Worker**（`blog-oauth.<account>.workers.dev`）：只负责鉴权，独立域名，不要在写给静态站

## 部署步骤

### A. 创建并部署 Worker
1. Cloudflare 控制台 → **Workers & Pages → Create → Worker**，名称填 `blog-oauth`
2. 进入 Worker → **Quick Edit**，把 `worker.js` 的内容全部粘贴进去替换默认代码 → **Deploy**

### B. 配置环境变量
Worker **Settings → Variables → Add**（**加密类型选 Encrypt**）：

| 变量 | 示例值 |
|---|---|
| `OAUTH_CLIENT_ID` | 第 C 步拿到的 GitHub Client ID |
| `OAUTH_CLIENT_SECRET` | 第 C 步拿到的 GitHub Client Secret |
| `ORIGINS` | `https://blog.baimuyuan.online,https://blog.1337630175.workers.dev,http://localhost:4321` |
| `REDIRECT_URL` | 不用填（默认自动是 `https://blog-oauth.<account>.workers.dev/callback`） |

> `ORIGINS` 是允许登录回传的站点白名单（逗号分隔）。如果以后新增域名，记得加进来；本地调试加 `http://localhost:4321`。

### C. 创建 GitHub OAuth App
1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
2. 填写：
   - **Application name**：`blog admin`
   - **Homepage URL**：`https://blog.baimuyuan.online/`
   - **Authorization callback URL**：`https://blog-oauth.<account>.workers.dev/callback`（**必须与 Worker 的 /callback 完全一致**）
3. 创建后复制 **Client ID** 和 **Client Secret**，填入 B 步

### D. 修改 CMS 配置
把站点仓库 `public/admin/config.yml` 顶部的 `backend.base_url` 改成 OAuth Worker 域名：

```yaml
backend:
  name: github
  repo: xiaoshancha/blog
  branch: master
  base_url: https://blog-oauth.<account>.workers.dev   # ← 三件套之一：认证代理
```

### E. 验证
1. 直接访问 `https://blog-oauth.<account>.workers.dev/` → 显示 `oauth ok`
2. 访问 `https://blog.baimuyuan.online/admin` → Sign in with GitHub → 应能弹出 GitHub 授权并返回后台

## 常见报错
- **/admin 打开白屏**：Sveltia CMS 从 `unpkg.com` 加载，国内网络可能不稳定，稍等或换网络
- **登录后提示 Invalid origin**：`ORIGINS` 里没包含当前站点域名
- **GitHub 返回 redirect_uri_mismatch**：GitHub App 的 callback 与 Worker 实际 `/callback` 不一致
