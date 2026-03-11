# Release Plan

Checklist for publishing Reelkit as an open-source library.

## Before First Publish

- [ ] **LICENSE file** - Add MIT LICENSE file to repo root
- [ ] **Commit working changes** - Large uncommitted diff with restructured components, new packages (`reelkit-react-lightbox`, `reelkit-react-reel-player`)
- [ ] **CI workflow for tests/lint** - Add GitHub Actions workflow that runs `lint`, `test`, `build`, and `e2e` on PRs
- [ ] **CI workflow for npm publish** - Automate `nx release` on tags or manual trigger (nx.json already has a `release` config)
- [ ] **Package metadata** - Add `description`, `repository`, `homepage`, `keywords`, `license`, and `author` fields to each library `package.json`
- [ ] **Decide scope of v0.1.0** - Non-React bindings (vue, svelte, dom, lit, wc) are in various states; decide whether to publish them or keep out of first release
- [ ] **Claim npm org** - Register `@reelkit` on npm
- [ ] **`.npmrc`** - Add `access=public` for scoped packages

## Nice-to-Have for Launch

- [ ] **CONTRIBUTING.md** - Guidelines for external contributors
- [ ] **Live demo** - Docs site could serve this purpose
- [ ] **Bundle size badge** - In README for instant credibility
- [x] **`bezier-easing` dependency** - Inlined cubic bezier implementation, core now truly has zero dependencies
