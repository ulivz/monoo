/**
 * Module dependencies
 */
import chalk from 'chalk';
import execa from 'execa';
import semver, { ReleaseType } from 'semver';
import inquirer from 'inquirer';
import { patch } from './patch';
import {
  logger,
  resolveLernaConfig,
  ensureLernaConfig,
  cleanLernaConfig,
} from './shared';
import { ReleaseNS } from './types';
import { changelog } from './changelog';

export { patch, changelog };

/**
 * Select version and tag to be released.
 */
async function selectVersionAndTag(currentVersion: string) {
  const customItem = { name: 'Custom', value: 'custom' };
  const bumps: ReleaseType[] = [
    'patch',
    'minor',
    'major',
    'prerelease',
    'premajor',
  ];
  const versions = bumps.reduce<Record<string, string>>((memo, bump) => {
    memo[bump] = semver.inc(currentVersion, bump);
    return memo;
  }, {});

  const bumpChoices = bumps.map((b) => ({
    name: `${b} (${versions[b]})`,
    value: b,
  }));

  function getVersion(answers: ReleaseNS.IPromptAnswers) {
    return answers.customVersion || versions[answers.bump];
  }

  function getNpmTags(version: string) {
    if (isPreRelease(version)) {
      return ['next', 'latest', 'beta', customItem];
    }
    return ['latest', 'next', 'beta', customItem];
  }

  function isPreRelease(version: string) {
    return Boolean(semver.prerelease(version));
  }

  const { bump, customVersion, npmTag, customNpmTag } =
    await inquirer.prompt<ReleaseNS.IPromptAnswers>([
      {
        name: 'bump',
        message: 'Select release type:',
        type: 'list',
        choices: [...bumpChoices, customItem],
      },
      {
        name: 'customVersion',
        message: 'Input version:',
        type: 'input',
        when: (answers) => answers.bump === 'custom',
      },
      {
        name: 'npmTag',
        message: 'Input npm tag:',
        type: 'list',
        default: (answers: ReleaseNS.IPromptAnswers) =>
          getNpmTags(getVersion(answers))[0],
        choices: (answers) => getNpmTags(getVersion(answers)),
      },
      {
        name: 'customNpmTag',
        message: 'Input customized npm tag:',
        type: 'input',
        when: (answers) => answers.npmTag === 'custom',
      },
    ]);

  const version = customVersion || versions[bump];
  const tag = customNpmTag || npmTag;
  return {
    tag,
    version,
  };
}

export async function release(options: ReleaseNS.IOptions) {
  const cwd = options.cwd ?? process.cwd();

  const config = resolveLernaConfig(cwd);

  if (!config?.path) {
    throw new Error('[MONO] "mono.json" or "lerna.json" doesn\'t exist');
  }

  const lernaConfig: ReleaseNS.ILernaConfig = config.data;

  if (lernaConfig.version === 'independent') {
    throw new Error(
      '[MONO] "release" cannot be executed under "independent" mode',
    );
  }

  if (typeof options.ready === 'function') {
    await options.ready({ cwd });
  }

  logger.info(`${chalk.gray('Current version: ')}${lernaConfig.version}`);

  const { version, tag } = await selectVersionAndTag(lernaConfig.version);

  const { yes } = await inquirer.prompt([
    {
      name: 'yes',
      message: `Confirm releasing ${version} (${tag})?`,
      type: 'list',
      choices: ['N', 'Y'],
    },
  ]);

  if (yes === 'N') {
    console.log('[MONO] cancelled.');
    return;
  }

  /**
   * Set this env for subsequent build process.
   */
  process.env.MONO_RELEASE_VERSION = version;

  /**
   * Execute custom build script before release.
   */
  if (options.build) {
    const buildScript =
      typeof options.build === 'string' ? options.build : 'npm run build';
    const [command, ...args] = buildScript.split(' ');
    await execa(command, args, {
      shell: true,
      cwd: options.cwd,
      stdio: 'inherit',
      env: process.env,
    });
  }

  let releaseArguments: string[] = [
    'publish',
    version,
    '--exact',
    '--force-publish',
    '--dist-tag',
    tag,
  ];

  if (typeof options.modifyReleaseArguments === 'function') {
    releaseArguments = options.modifyReleaseArguments({
      arguments: releaseArguments,
      version,
      tag,
    });
  }

  if (options.ignoreScripts) {
    releaseArguments.push('--ignore-scripts');
  }

  ensureLernaConfig(cwd);

  try {
    await execa(
      require.resolve('lerna/cli.js', {
        paths: [cwd, __dirname],
      }),
      releaseArguments,
      {
        stdio: 'inherit',
      },
    );
  } catch (e) {
    console.log(e);

    await patch({
      cwd,
      version,
      tag,
      runInBand: options.runInBand,
      ignoreScripts: options.ignoreScripts,
    });
  }

  if (typeof options.released === 'function') {
    await options.released({ cwd, version, tag });
  }

  cleanLernaConfig(cwd);

  if (options.changelog) {
    await changelog({
      cwd,
      beautify: true,
      commit: true,
      gitPush: true,
      attachAuthor: true,
      authorNameType: 'email',
    });
  }
}
