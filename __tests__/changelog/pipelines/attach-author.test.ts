/**
 * Module dependencies
 */
import { ChangelogProcessor4AttachAuthor } from '../../../src/r/changelog/pipelines/attach-author';
import { ChangelogNS } from '../../../src/r/types';

jest.mock(require.resolve('../../../src/r/changelog/helpers'), () => {
  const mockedAuthor: ChangelogNS.ICommitAuthor = {
    name: '<name>',
    email: '<email>',
    emailName: '<emailName>',
  };

  const mockedAuthor2: ChangelogNS.ICommitAuthor = {
    name: '<name2>',
    email: '<email2>',
    emailName: '<emailName2>',
  };

  return {
    getCommitHashAuthorMap: () => {
      return {
        aaaaaaa: mockedAuthor,
        bbbbbbb: mockedAuthor,
        ccccccc: mockedAuthor2,
        ddddddd: mockedAuthor2,
      };
    },
  };
});

describe('ChangelogProcessor4AttachAuthor', () => {
  describe('update changelog without author', () => {
    const input = `
## [0.2.4](https://github.com/speedy/mono/compare/v0.2.3...v0.2.4) (2021-10-23)


### Bug Fixes

* \`--ignore-scripts\` description ([aaaaaaa](https://github.com/speedy/mono/commits/663a3963b63706d273068895f4dd79d6c70472c2))



## [0.2.3](https://github.com/speedy/mono/compare/v0.2.2...v0.2.3) (2021-10-20)


### Bug Fixes

* The "path" argument must be of type string. Received undefined ([bbbbbbb](https://github.com/speedy/mono/commits/1a377bb70193547e2cf9faaa288fbf5fcdc4b66f))
  `;

    it('default', () => {
      expect(
        ChangelogProcessor4AttachAuthor('<cwd>', input, {}),
      ).toMatchSnapshot();
    });

    it('options - displayType', () => {
      expect(
        ChangelogProcessor4AttachAuthor('<cwd>', input, {
          displayType: 'email',
        }),
      ).toMatchSnapshot();
    });

    it('options - getAuthorPage', () => {
      expect(
        ChangelogProcessor4AttachAuthor('<cwd>', input, {
          getAuthorPage(author) {
            return `/page/to/author/${author.emailName}`;
          },
        }),
      ).toMatchSnapshot();
    });
  });

  describe('update changelog with author', () => {
    const input = `
## [0.2.4](https://github.com/speedy/mono/compare/v0.2.3...v0.2.4) (2021-10-23)


### Bug Fixes

* \`--ignore-scripts\` description ([aaaaaaa](https://github.com/speedy/mono/commits/663a3963b63706d273068895f4dd79d6c70472c2))



## [0.2.3](https://github.com/speedy/mono/compare/v0.2.2...v0.2.3) (2021-10-20)


### Bug Fixes

* The "path" argument must be of type string. Received undefined ([bbbbbbb](https://github.com/speedy/mono/commits/1a377bb70193547e2cf9faaa288fbf5fcdc4b66f)) [@<name>](https://github.com/<emailName>)
  `;

    it('default', () => {
      expect(
        ChangelogProcessor4AttachAuthor('<cwd>', input, {}),
      ).toMatchSnapshot();
    });

    it('options - displayType', () => {
      expect(
        ChangelogProcessor4AttachAuthor('<cwd>', input, {
          displayType: 'email',
        }),
      ).toMatchSnapshot();
    });

    it('options - getAuthorPage', () => {
      expect(
        ChangelogProcessor4AttachAuthor('<cwd>', input, {
          getAuthorPage(author) {
            return `/page/to/author/${author.emailName}`;
          },
        }),
      ).toMatchSnapshot();
    });
  });
});
