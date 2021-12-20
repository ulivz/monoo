/**
 * Module dependencies
 */
import { ChangelogNS } from '../../types';
import { TChangelogProcessor } from './shared';
import { getCommitHashAuthorMap } from '../helpers';
import { COMMIT_RE } from '../regexp';

export interface IDisplayAuthorOptions {
  getAuthorPage?(author: ChangelogNS.ICommitAuthor): string;
  displayType?: 'name' | 'email';
}

export const ChangelogProcessor4AttachAuthor: TChangelogProcessor<IDisplayAuthorOptions> =
  (cwd, input, options = {}) => {
    const displayType = options.displayType ?? 'name';
    const getAuthorPage =
      options.getAuthorPage ??
      ((author: ChangelogNS.ICommitAuthor) => {
        return `https://github.com/${author.emailName}`;
      });

    const hashAuthorMap = getCommitHashAuthorMap(cwd);
    const ret = input.replace(
      COMMIT_RE,
      (
        m,
        s1 /* hash */,
        s2 /* url */,
        s3 /* white space */,
        s4 /* author part */,
        s5 /* author text */,
      ): string => {
        const author = hashAuthorMap[s1];
        /**
         * s4 exists, do not need generate author
         */
        if (!author || s4) {
          return m;
        }
        const dispalyName =
          displayType === 'name' ? author.name : author.emailName;
        const authorUrl = getAuthorPage(author);
        return `([${s1}](${s2})) [@${dispalyName}](${authorUrl})`;
      },
    );

    return ret;
  };
