# Contributing to ReelKit

Thanks for your interest in contributing to ReelKit! This guide will help you get started.

## Prerequisites

- Node.js >= 20
- npm >= 10

## Development Workflow

```bash
# Build all packages
npm run build

# Run the React example app (localhost:4200)
npx nx dev example-react

# Run the Angular example app (localhost:4200)
npx nx dev example-angular

# Run the Vue example app (localhost:4200)
npx nx dev example-vue

# Run the Next.js example app (localhost:3000)
npx nx dev example-next

# Run the Nuxt example app (localhost:3000)
npx nx dev example-nuxt

# Run the docs site (localhost:4200)
npx nx dev docs

# Run all tests
npm test

# Run tests for one package — any name from the table below
npx nx test @reelkit/core
npx nx test @reelkit/vue-lightbox

# Format check + lint + typecheck + docs drift check
npm run check

# Format (auto-fix)
npm run fmt

# Run E2E tests
npm run e2e
```

## Project Structure

This is an Nx monorepo with the following packages:

| Package                         | Path                                    | Description                             |
| ------------------------------- | --------------------------------------- | --------------------------------------- |
| `@reelkit/core`                 | `packages/reelkit-core`                 | Framework-agnostic slider engine        |
| `@reelkit/stories-core`         | `packages/reelkit-stories-core`         | Framework-agnostic stories engine       |
| `@reelkit/react`                | `packages/reelkit-react`                | React components and hooks              |
| `@reelkit/react-reel-player`    | `packages/reelkit-react-reel-player`    | Full-screen video reel player (React)   |
| `@reelkit/react-lightbox`       | `packages/reelkit-react-lightbox`       | Image gallery lightbox (React)          |
| `@reelkit/react-stories-player` | `packages/reelkit-react-stories-player` | Instagram-style stories player (React)  |
| `@reelkit/angular`              | `packages/reelkit-angular`              | Angular components and directives       |
| `@reelkit/angular-reel-player`  | `packages/reelkit-angular-reel-player`  | Full-screen video reel player (Angular) |
| `@reelkit/angular-lightbox`     | `packages/reelkit-angular-lightbox`     | Image gallery lightbox (Angular)        |
| `@reelkit/vue`                  | `packages/reelkit-vue`                  | Vue 3 components and composables        |
| `@reelkit/vue-reel-player`      | `packages/reelkit-vue-reel-player`      | Full-screen video reel player (Vue)     |
| `@reelkit/vue-lightbox`         | `packages/reelkit-vue-lightbox`         | Image gallery lightbox (Vue)            |

## Making Changes

1. Fork the repo and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/reelkit.git
   cd reelkit
   npm install
   ```

2. Make your changes and ensure they pass:

   ```bash
   npm run check && npm test && npm run build
   ```

3. If your change alters what a published package does, add a version plan —
   releases are cut from these, so a change without one ships with no
   changelog entry and no version bump:

   ```bash
   npx nx release plan
   ```

   Pick the affected packages and the bump level, then write the message. The
   body **is** the changelog entry, published verbatim, so write it for
   someone using the package rather than as a summary of your diff:
   - One user-visible change per line. The changelog renderer turns each line
     into its own bullet, so several concerns joined by `;` become one
     unreadable bullet.
   - `BREAKING:` must start its own line, otherwise it is not lifted into the
     breaking-changes section and the migration note is buried mid-sentence.
   - Leave out internal refactors, implementation detail, and fixes for bugs
     that never shipped — none of it means anything to a consumer.

   Docs-only and tooling changes need no plan.

4. Commit using clear, descriptive messages (we follow [Conventional Commits](https://www.conventionalcommits.org/)). The scope lists every package the change touches:

   ```
   feat(core, react): add swipe velocity threshold option
   fix(react-reel-player): prevent double-tap triggering next slide
   docs(docs): update lightbox API reference
   ```

5. Push and open a pull request against `main`.

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR.
- Include a clear description of what changed and why.
- Add tests for new features or bug fixes when applicable.
- Make sure all CI checks pass before requesting review.
- Update relevant documentation if your change affects the public API.

## Code Conventions

- **Factory functions over classes** — use the `createXController` pattern in core.
- **TypeScript strict mode** — no `any` unless absolutely necessary.
- **Zero dependencies in core** — `@reelkit/core` must remain dependency-free.
- **CSS class prefix** — all CSS classes use the `rk-` prefix.
- **ES modules only** — all packages build to ESM.
- **Angular conventions** — standalone components, signal inputs/outputs, `inject()`, `OnPush`, no explicit `standalone: true` (it has been the default since v19).
- **React conventions** — functional components, hooks, `memo` for performance.
- **Vue conventions** — Composition API with `<script setup lang="ts">`, `defineProps`/`defineEmits`/`defineModel`, provide/inject for parent-child wiring.

## Reporting Issues

- Use [GitHub Issues](https://github.com/KonstantinKai/reelkit/issues) to report bugs or request features.
- Include a minimal reproduction when reporting bugs.
- Check existing issues before opening a new one.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
