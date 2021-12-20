/**
 * Module dependencies
 */
import { TChangelogProcessor } from './shared';
import { COMMIT_RE } from '../regexp';

/**
 * Normalize commit url
 *
 * @param cwd
 * @param input
 * @returns
 */
export const ChangelogProcessor4NormalizeCommitUrl: TChangelogProcessor = (
  cwd,
  input,
) => {
  return input.replace(
    COMMIT_RE,
    (
      m,
      s1 /* hash */,
      s2 /* url */,
      s3 /* white space */,
      s4 /* author part */,
      s5 /* author text */,
    ): string => {
      return m.replace('commits', 'commit');
    },
  );
};
