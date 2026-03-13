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

# Run the Next.js example app (localhost:3000)
npx nx dev example-next

# Run the docs site (localhost:4200)
npx nx dev docs

# Run all tests
npm test

# Run tests for a specific package
npx nx test @reelkit/core
npx nx test @reelkit/react

# Typecheck
npm run typecheck

# Lint
npm run lint

# Format check
npm run fmt:chk

# Format (auto-fix)
npm run fmt

# Run E2E tests
npm run e2e
```

## Project Structure

This is an Nx monorepo with the following packages:

| Package                      | Path                                 | Description                      |
| ---------------------------- | ------------------------------------ | -------------------------------- |
| `@reelkit/core`              | `packages/reelkit-core`              | Framework-agnostic slider engine |
| `@reelkit/react`             | `packages/reelkit-react`             | React components and hooks       |
| `@reelkit/react-reel-player` | `packages/reelkit-react-reel-player` | Full-screen video reel player    |
| `@reelkit/react-lightbox`    | `packages/reelkit-react-lightbox`    | Image gallery lightbox           |

## Making Changes

1. Fork the repo and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/reelkit.git
   cd reelkit
   npm install
   ```

2. Make your changes and ensure they pass:

   ```bash
   npm run fmt:chk && npm run lint && npm test && npm run typecheck && npm run build
   ```

3. Commit using clear, descriptive messages (we follow [Conventional Commits](https://www.conventionalcommits.org/)):

   ```
   feat: add swipe velocity threshold option
   fix: prevent double-tap triggering next slide
   docs: update lightbox API reference
   ```

4. Push and open a pull request against `main`.

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR.
- Include a clear description of what changed and why.
- Add tests for new features or bug fixes when applicable.
- Make sure all CI checks pass before requesting review.
- Update relevant documentation if your change affects the public API.

## Code Conventions

- **Factory functions over classes** — use the `createXController` pattern.
- **TypeScript strict mode** — no `any` unless absolutely necessary.
- **Zero dependencies in core** — `@reelkit/core` must remain dependency-free.
- **CSS class prefix** — all CSS classes use the `rk-` prefix.
- **ES modules only** — all packages build to ESM.

## Reporting Issues

- Use [GitHub Issues](https://github.com/KonstantinKai/reelkit/issues) to report bugs or request features.
- Include a minimal reproduction when reporting bugs.
- Check existing issues before opening a new one.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
