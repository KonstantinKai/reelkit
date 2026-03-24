import DefaultChangelogRenderer from 'nx/release/changelog-renderer';
import type { ChangelogChange } from 'nx/release/changelog-renderer';

/**
 * Custom changelog renderer that formats per-project entries
 * for a single workspace-level CHANGELOG.md.
 *
 * Since Nx doesn't support workspace changelogs with independent
 * versioning, we use projectChangelogs pointing to {workspaceRoot}/CHANGELOG.md
 * and prepend each project entry with its name and version.
 *
 * Overrides:
 * - Version title includes project name (e.g. `## @reelkit/core@0.2.0`)
 * - formatChange extracts only the current project's description from
 *   multi-project version plan bodies
 */
export default class ChangelogRenderer extends DefaultChangelogRenderer {
  override renderVersionTitle(): string {
    const date =
      this.changelogRenderOptions.versionTitleDate !== false
        ? ` (${new Date().toISOString().slice(0, 10)})`
        : '';

    if (this.project) {
      return `## ${this.project}@${this.changelogEntryVersion}${date}`;
    }

    return `## ${this.changelogEntryVersion}${date}`;
  }

  override formatChange(change: ChangelogChange): string {
    const lines = change.description.split('\n');

    const thanks = lines
      .filter((l) => l.trimStart().toLowerCase().startsWith('thanks to '))
      .flatMap((l) =>
        l
          .trimStart()
          .replace(/^thanks to /i, '')
          .split(/[,&]/)
          .map((name) => name.trim())
          .filter(Boolean),
      );

    const appendThanks = (entry: string) =>
      thanks.length > 0
        ? `${entry}\n\n### ❤️ Thanks\n\n${thanks.map((t) => {
            const name = t.startsWith('@') ? t : `@${t}`;
            return `- [${name}](https://github.com/${name.slice(1)})`;
          }).join('\n')}`
        : entry;

    if (!this.project || !change.description.includes('\n')) {
      return appendThanks(super.formatChange(change));
    }

    // Extract only the current project's description from the version plan body.
    // Version plan body format:
    //   @reelkit/core → minor
    //     Description text here
    //
    //   @reelkit/react → minor
    //     Description text here
    const projectPrefix = `${this.project} `;
    let capturing = false;
    const projectLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trimStart();
      if (trimmed.startsWith(projectPrefix)) {
        capturing = true;
        continue;
      }
      if (capturing) {
        if (
          trimmed.startsWith('@') ||
          (trimmed === '' && projectLines.length > 0)
        ) {
          break;
        }
        if (trimmed) {
          projectLines.push(trimmed);
        }
      }
    }

    const description =
      projectLines.length > 0
        ? projectLines.join(' ')
        : change.description.split('\n')[0];

    const ref =
      this.changelogRenderOptions.commitReferences !== false && change.shortHash
        ? ` (${change.shortHash})`
        : '';

    return appendThanks(`- ${description}${ref}`);
  }
}
