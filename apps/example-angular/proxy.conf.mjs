import { readFileSync } from 'fs';

let token = '';
try {
  const envFile = readFileSync(
    new URL('../../.env.local', import.meta.url),
    'utf-8',
  );
  token = envFile.match(/VITE_CDN_TOKEN=(.+)/)?.[1]?.trim() || '';
} catch {
  // .env.local not found — CDN proxy will work without token in production
}

export default {
  '/cdn': {
    target: 'https://cdn.reelkit.dev',
    secure: true,
    changeOrigin: true,
    pathRewrite: { '^/cdn': '' },
    headers: {
      'X-RK-Token': token,
      Origin: 'http://localhost:4200',
    },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('X-RK-Token', token);
      proxyReq.setHeader('Origin', 'http://localhost:4200');
    },
  },
};
