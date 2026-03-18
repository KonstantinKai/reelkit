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
    if (!this.project || !change.description.includes('\n')) {
      return super.formatChange(change);
    }

    // Extract only the current project's description from the version plan body.
    // Version plan body format:
    //   @reelkit/core → minor
    //     Description text here
    //
    //   @reelkit/react → minor
    //     Description text here
    const lines = change.description.split('\n');
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
        // Stop at next project header or empty line between sections
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

    return `- ${description}${ref}`;
  }
}
