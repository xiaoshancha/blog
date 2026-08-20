/**
 * GitHub OAuth 认证代理（为 Sveltia CMS / Decap CMS 后台提供 /auth 与 /callback）
 *
 * 协议参考：vencax/netlify-cms-github-oauth-provider（Decap 官方推荐实现）
 * 部署：Cloudflare Workers
 *
 * 需要配置的环境变量（Worker Settings → Variables）：
 *   OAUTH_CLIENT_ID       - GitHub OAuth App 的 Client ID
 *   OAUTH_CLIENT_SECRET   - GitHub OAuth App 的 Client Secret
 *   ORIGINS               - 允许登录的站点来源，逗号分隔，例如：
 *                           https://blog.baimuyuan.online,https://blog.1337630175.workers.dev,http://localhost:4321
 *   REDIRECT_URL          - 可选，默认自动取本 Worker 域名 + /callback，一般不用填
 */

function randomString(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

function loginScript(provider, message, content, origins) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /></head><body><script>
(function () {
  var allowed = ${JSON.stringify((origins || '').split(',').map((s) => s.trim()).filter(Boolean))};
  function clean(o) { return o.replace(/^https?:\\/\\//, '').replace(/\\/$/, ''); }
  function inList(origin) {
    var c = clean(origin);
    for (var i = 0; i < allowed.length; i++) {
      var d = clean(allowed[i]); // 白名单条目去掉协议前缀再比较（修复永不匹配 bug）
      if (d === '*') return true;
      if (d.indexOf('*') >= 0) {
        var re = new RegExp('^' + d.replace(/\\./g, '\\\\.').replace(/\*/g, '.*') + '$');
        if (re.test(c)) return true;
      } else if (d === c) {
        return true;
      }
    }
    return false;
  }
  function receive(e) {
    if (!inList(e.origin)) { console.log('Invalid origin: ' + e.origin); return; }
    window.opener.postMessage(
      'authorization:${provider}:${message}:' + JSON.stringify(${JSON.stringify(content)}),
      e.origin
    );
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:${provider}', '*');
})();
<\/script></body></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const base = url.origin;

    // 健康检查/根路径
    if (url.pathname === '/' || url.pathname === '/_health') {
      return new Response('oauth ok', { status: 200 });
    }

    // —— 第 1 步：CMS 弹窗跳转 /auth，这里重定向到 GitHub 授权页 ——
    if (url.pathname === '/auth') {
      const provider = url.searchParams.get('provider') || 'github';
      if (provider !== 'github') {
        return new Response('Unsupported provider: ' + provider, { status: 400 });
      }
      const redirectUri = env.REDIRECT_URL || `${base}/callback`;
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
      authUrl.searchParams.set('state', randomString(32));
      return Response.redirect(authUrl.toString(), 302);
    }

    // —— 第 2 步：GitHub 回调 /callback?code=...，换 access_token 并把结果弹给 CMS ——
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const redirectUri = env.REDIRECT_URL || `${base}/callback`;
      const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
      try {
        // GitHub 支持以 client_id:client_secret 作为 Basic Auth
        headers.Authorization =
          'Basic ' + btoa(env.OAUTH_CLIENT_ID + ':' + env.OAUTH_CLIENT_SECRET);
      } catch (_) {
        return new Response('Missing OAuth client config', { status: 500 });
      }

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, redirect_uri: redirectUri }),
      });
      const tokenData = await tokenRes.json();

      if (tokenData.error || !tokenData.access_token) {
        return new Response(
          loginScript('github', 'error', JSON.stringify(tokenData), env.ORIGINS),
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      const content = { token: tokenData.access_token, provider: 'github' };
      return new Response(loginScript('github', 'success', content, env.ORIGINS), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
