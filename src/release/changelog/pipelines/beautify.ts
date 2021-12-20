/**
 * Module dependencies
 */
import { TChangelogProcessor } from './shared';

/**
 * Remove top-level useless header
 *
 * @see https://github.com/conventional-changelog/conventional-changelog/issues/376
 * @param cwd
 * @param input
 * @returns
 */
export const ChangelogProcessor4Beautify: TChangelogProcessor = (
  cwd,
  input,
) => {
  input = input.trim();
  const changelogLines = input.split('\n');
  if (/# \[((0|1)\.0\.0)?\]/.test(changelogLines[0])) {
    input = changelogLines.slice(1).join('\n').trim();
  }
  return input;
};
