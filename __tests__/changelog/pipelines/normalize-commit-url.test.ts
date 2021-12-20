/**
 * Module dependencies
 */
import { ChangelogProcessor4NormalizeCommitUrl } from '../../../src/release/changelog/pipelines/normalize-commit-url';

describe('ChangelogProcessor4NormalizeCommitUrl', () => {
  const input = `# [0.0.0](https://github.com/speedy/mono/compare/v0.2.3...v0.2.4) (2021-10-23)

## [0.2.4](https://github.com/speedy/mono/compare/v0.2.3...v0.2.4) (2021-10-23)


### Bug Fixes

* \`--ignore-scripts\` description ([663a396](https://github.com/speedy/mono/commits/663a3963b63706d273068895f4dd79d6c70472c2))
  
  `;

  it('default', () => {
    expect(
      ChangelogProcessor4NormalizeCommitUrl('<cwd>', input, {}),
    ).toMatchSnapshot();
  });
});
