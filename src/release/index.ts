/**
 * Module dependencies
 */
import chalk from "chalk";
import execa from "execa";
import semver, { ReleaseType } from "semver";
import inquirer from "inquirer";
import { patch } from "./patch";
import {
  logger,
  resolveLernaConfig,
  ensureLernaConfig,
  cleanLernaConfig,
} from "./shared";
import { ReleaseNS, ChangelogNS } from "./types";
import { changelog } from "./changelog";

export { patch, changelog };

/**
 * Select version and tag to be released.
 */
async function selectVersionAndTag(currentVersion: string) {
  const customItem = { name: "Custom", value: "custom" };
  const bumps: ReleaseType[] = [
    "patch",
    "minor",
    "major",
    "prerelease",
    "premajor",
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
      return ["next", "latest", "beta", customItem];
    }
    return ["latest", "next", "beta", customItem];
  }

  function isPreRelease(version: string) {
    return Boolean(semver.prerelease(version));
  }

  const { bump, customVersion, npmTag, customNpmTag } =
    await inquirer.prompt<ReleaseNS.IPromptAnswers>([
      {
        name: "bump",
        message: "Select release type:",
        type: "list",
        choices: [...bumpChoices, customItem],
      },
      {
        name: "customVersion",
        message: "Input version:",
        type: "input",
        when: (answers) => answers.bump === "custom",
      },
      {
        name: "npmTag",
        message: "Input npm tag:",
        type: "list",
        default: (answers: ReleaseNS.IPromptAnswers) =>
          getNpmTags(getVersion(answers))[0],
        choices: (answers) => getNpmTags(getVersion(answers)),
      },
      {
        name: "customNpmTag",
        message: "Input customized npm tag:",
        type: "input",
        when: (answers) => answers.npmTag === "custom",
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
  if (options.dryRun) {
    logger.info(`[dry-run] enabled`);
  }

  const cwd = options.cwd ?? process.cwd();

  const config = resolveLernaConfig(cwd);

  if (!config?.path) {
    throw new Error('"mono.json" or "lerna.json" doesn\'t exist');
  }

  const lernaConfig: ReleaseNS.ILernaConfig = config.data;

  if (lernaConfig.version === "independent") {
    throw new Error('"release" cannot be executed under "independent" mode');
  }

  if (typeof options.ready === "function") {
    await options.ready({ cwd });
  }

  logger.info(`${chalk.gray("Current version: ")}${lernaConfig.version}`);

  const { version, tag } = await selectVersionAndTag(lernaConfig.version);

  const { yes } = await inquirer.prompt([
    {
      name: "yes",
      message: `Confirm releasing ${version} (${tag})?`,
      type: "list",
      choices: ["N", "Y"],
    },
  ]);

  if (yes === "N") {
    logger.info("cancelled.");
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
      typeof options.build === "string" ? options.build : "npm run build";
    if (options.dryRun) {
      logger.info("[dry-run] run build with: " + chalk.gray(buildScript));
    } else {
      const [command, ...args] = buildScript.split(" ");
      await execa(command, args, {
        shell: true,
        cwd: options.cwd,
        stdio: "inherit",
        env: process.env,
      });
    }
  }

  let releaseArguments: string[] = [
    "publish",
    version,
    "--exact",
    "--force-publish",
    "--dist-tag",
    tag,
  ];

  if (typeof options.modifyReleaseArguments === "function") {
    releaseArguments = options.modifyReleaseArguments({
      arguments: releaseArguments,
      version,
      tag,
    });
  }

  if (options.ignoreScripts) {
    releaseArguments.push("--ignore-scripts");
  }

  ensureLernaConfig(cwd);

  const lernaPath = require.resolve("lerna/cli.js", {
    paths: [cwd, __dirname],
  });
  if (options.dryRun) {
    logger.info("[dry-run] run publish with:");
    logger.info(
      "[dry-run] " + chalk.gray(lernaPath + " " + releaseArguments.join(" "))
    );
    logger.info("[dry-run] enter patch process");
    logger.info("[dry-run] finish patch process");
  } else {
    try {
      await execa(lernaPath, releaseArguments, {
        stdio: "inherit",
      });
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
  }

  if (typeof options.released === "function") {
    await options.released({ cwd, version, tag });
  }

  cleanLernaConfig(cwd);

  if (options.changelog) {
    const changelogOptions: ChangelogNS.IOptions = {
      cwd,
      beautify: true,
      commit: true,
      gitPush: true,
      attachAuthor: true,
      authorNameType: "email",
    };
    if (options.dryRun) {
      logger.info(
        "[dry-run] generate change with " +
          chalk.gray(JSON.stringify(changelogOptions, null, 2))
      );
    } else {
      await changelog();
    }
  }
}
