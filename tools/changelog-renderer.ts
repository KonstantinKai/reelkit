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
 * - Multi-line descriptions are rendered as separate bullet points
 * - Lines starting with `BREAKING:` are extracted into a dedicated
 *   "⚠️ Breaking Changes" section
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
    const rawLines = change.description.split('\n');

    const thanks = rawLines
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

    // For multi-project version plans, extract only the current project's lines
    let descriptionLines: string[] = [];

    if (this.project && change.description.includes('\n')) {
      const projectPrefix = `${this.project} `;
      let capturing = false;
      const projectLines: string[] = [];

      for (const line of rawLines) {
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

      descriptionLines = projectLines.length > 0 ? projectLines : [];
    }

    // Fallback: use all non-empty, non-thanks lines
    if (descriptionLines.length === 0) {
      descriptionLines = rawLines.filter((l) => {
        const t = l.trim();
        return t && !t.toLowerCase().startsWith('thanks to ');
      });
    }

    // Separate feature lines from breaking change lines
    const featureLines: string[] = [];
    const breakingLines: string[] = [];

    for (const line of descriptionLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('BREAKING:')) {
        breakingLines.push(trimmed.replace(/^BREAKING:\s*/, ''));
      } else {
        featureLines.push(trimmed);
      }
    }

    // Push breaking changes to the inherited breakingChanges array
    // so they render under "⚠️ Breaking Changes"
    for (const item of breakingLines) {
      this.breakingChanges.push(`- ${item}`);
    }

    const ref =
      this.changelogRenderOptions.commitReferences !== false && change.shortHash
        ? ` (${change.shortHash})`
        : '';

    const bullets = featureLines.map((l) => `- ${l}`).join('\n');

    return appendThanks(ref ? bullets + ref : bullets);
  }
}
