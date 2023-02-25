/**
 * Module dependencies
 */
import { execa } from '@monoo/shared';
import { ChangelogNS } from '../types';

/**
 * Create changelog
 *
 * @param {Boolean} isFirst first release or not.
 * @returns {Promise<void>}
 */

export async function generateChangelog(cwd: string, isFirst = false) {
  await execa(
    require.resolve('conventional-changelog-cli/cli.js', {
      paths: [process.cwd(), ...module.paths],
    }),
    ['-p', 'angular', '-i', 'CHANGELOG.md', '-s', '-r', isFirst ? '0' : '2'],
    {
      stdio: 'inherit',
    },
  );
}

/**
 * Create a commit for changelog via a specific version.
 *
 * @param {String} version
 * @returns {Promise<void>}
 */

export async function createChangelogCommit(cwd: string, version: string) {
  await execa('git', ['add', '-A'], { stdio: 'inherit' });
  await execa('git', ['commit', '-m', `chore(all): ${version} changelog`], {
    stdio: 'inherit',
  });
}

/**
 * Get commit author from commit hash
 *
 * @param cwd
 * @param hash
 * @returns
 */
export function getCommitAuthorFromCommitHash(cwd: string, hash: string) {
  const rest = execa.sync(
    'git',
    ['--no-pager', 'show', '-s', '--pretty=%an', hash],
    { cwd },
  );
  return rest.stdout;
}

/**
 * Get commit author from commit hash
 *
 * @param cwd
 * @param hash
 * @returns
 */
export function getCommitAuthorFromHash(
  cwd: string,
  hash: string,
): ChangelogNS.ICommitAuthor {
  try {
    const rest = execa.sync(
      'git',
      ['--no-pager', 'show', '-s', '--pretty=%an,%ae', hash],
      { cwd },
    );
    const [name, email] = rest.stdout.split(',');
    const emailName = email.slice(0, email.indexOf('@'));
    return {
      name,
      email,
      emailName,
    };
  } catch (e) {
    return {
      name: 'N/A',
      email: 'N/A',
      emailName: 'N/A',
    };
  }
}

/**
 * Get commit author from commit hash
 *
 * @param cwd
 * @param hash
 * @returns
 */
export function getCommitHashAuthorMap(
  cwd: string,
): Record<string, ChangelogNS.ICommitAuthor> {
  try {
    const rest = execa.sync(
      'git',
      ['--no-pager', 'log', '--pretty=%h,%an,%ae'],
      { cwd },
    );
    const FALLBACK = 'N/A';
    const result = rest.stdout
      .split('\n')
      .reduce<Record<string, ChangelogNS.ICommitAuthor>>((memo, current) => {
        const [hash, name, email] = current.split(',');
        const emailName = email && email.slice(0, email.indexOf('@'));
        memo[hash.slice(0, 7)] = {
          name: name.replace(/\s/g, '&nbsp;') || FALLBACK,
          email: email || FALLBACK,
          emailName: emailName || FALLBACK,
        };
        return memo;
      }, {});
    return result;
  } catch (e) {
    return {};
  }
}
