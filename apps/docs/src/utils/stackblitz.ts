import type { Project } from '@stackblitz/sdk';

// NOTE: Update these when publishing new versions
const REELKIT_PACKAGES: Record<string, string> = {
  '@reelkit/core': '0.2.1',
  '@reelkit/react': '0.2.1',
  '@reelkit/react-reel-player': '0.2.1',
  '@reelkit/react-lightbox': '0.2.1',
};

const PACKAGES_REQUIRING_CORE = [
  '@reelkit/react',
  '@reelkit/react-reel-player',
  '@reelkit/react-lightbox',
];

const PACKAGES_REQUIRING_REACT = [
  '@reelkit/react-reel-player',
  '@reelkit/react-lightbox',
];

function resolveTransitiveDeps(
  deps: Record<string, string>,
): Record<string, string> {
  const resolved = { ...deps };

  for (const pkg of Object.keys(deps)) {
    if (PACKAGES_REQUIRING_REACT.includes(pkg) && !resolved['@reelkit/react']) {
      resolved['@reelkit/react'] = REELKIT_PACKAGES['@reelkit/react'];
    }
    if (PACKAGES_REQUIRING_CORE.includes(pkg) && !resolved['@reelkit/core']) {
      resolved['@reelkit/core'] = REELKIT_PACKAGES['@reelkit/core'];
    }
  }

  return resolved;
}

export function createStackBlitzProject(opts: {
  title: string;

  code: string;

  dependencies: Record<string, string>;
}): Project {
  const allDeps = resolveTransitiveDeps(opts.dependencies);

  const packageJson = JSON.stringify(
    {
      name: 'reelkit-sandbox',
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
      },
      dependencies: {
        react: '18.3.1',
        'react-dom': '18.3.1',
        ...allDeps,
      },
      devDependencies: {
        '@types/react': '18.3.1',
        '@types/react-dom': '18.3.0',
        '@vitejs/plugin-react': '^4.2.0',
        typescript: '~5.6.0',
        vite: '^6.0.0',
      },
    },
    null,
    2,
  );

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${opts.title}</title>
    <link rel="stylesheet" href="/src/index.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  const indexCss = `*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(8px);
  transition: background 0.2s, opacity 0.2s;
}

button:hover {
  background: rgba(255, 255, 255, 0.25);
}

button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

button svg {
  width: 20px;
  height: 20px;
}

img {
  display: block;
  max-width: 100%;
}
`;

  const mainTsx = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);`;

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`;

  const tsconfig = JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: 'force',
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
      },
      include: ['src'],
    },
    null,
    2,
  );

  return {
    title: opts.title,
    template: 'node',
    files: {
      'package.json': packageJson,
      'index.html': indexHtml,
      'src/index.css': indexCss,
      'src/main.tsx': mainTsx,
      'src/App.tsx': opts.code,
      'vite.config.ts': viteConfig,
      'tsconfig.json': tsconfig,
    },
  };
}
