/**
 * Module dependencies
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { generateChangelog, createChangelogCommit } from './helpers';
import { resolveLernaConfig, resolvePackageJson, gitPush } from '../shared';
import { ChangelogNS } from '../types';
import {
  ChangelogProcessor4Beautify,
  ChangelogProcessor4AttachAuthor,
  ChangelogProcessor4NormalizeCommitUrl,
  ChangelogProcessor,
} from './pipelines';

/**
 * Expose `changelog`
 */
export async function changelog(options: ChangelogNS.IOptions = {}) {
  options = {
    beautify: false,
    commit: false,
    gitPush: false,
    attachAuthor: true,
    authorNameType: 'name',
    ...options,
  };

  let { version } = options;

  if (!version) {
    try {
      const config = resolveLernaConfig(options.cwd);
      version = config?.data.version;
    } catch (e) {
      // dot not handle it for now
    }

    if (!version) {
      const pkgJson = resolvePackageJson();
      version = pkgJson.version;
    }
  }

  const changelogPath = join(options.cwd, 'CHANGELOG.md');
  const isFirst = !existsSync(changelogPath);
  await generateChangelog(options.cwd, isFirst);

  let changelogContent = readFileSync(changelogPath, 'utf-8');

  const processor = new ChangelogProcessor(options.cwd, changelogContent);
  processor.addProcessor(ChangelogProcessor4NormalizeCommitUrl, {});

  if (options.attachAuthor) {
    processor.addProcessor(ChangelogProcessor4AttachAuthor, {
      displayType: options.authorNameType,
      getAuthorPage: options.getAuthorPage,
    });
  }

  if (options.beautify) {
    processor.addProcessor(ChangelogProcessor4Beautify, {});
  }

  changelogContent = processor.process();

  writeFileSync(changelogPath, changelogContent, 'utf-8');

  if (options.commit) {
    await createChangelogCommit(options.cwd, version);
  }

  if (options.gitPush) {
    await gitPush();
  }
}
