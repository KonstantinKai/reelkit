/// <reference types="vite/client" />

// Vite's ambient types cover `import.meta.glob`, `?raw` imports and the rest
// of the bundler-only surface. Listing `vite/client` in a tsconfig `types`
// array reaches whichever project that config builds, but the editor resolves
// a file through the first config whose `include` matches it — for anything
// under `src` that is `tsconfig.json`, which sets no `types` at all. The
// reference lives here instead so it travels with the sources.
