/**
 * Module dependencies
 */
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import chalk from "chalk";
import inquirer from "inquirer";
import execa from "execa";
import { resolveLernaConfig, resolvePackages, logger } from "../shared";
import { PatchNS, NpmNS } from "../types";
import { getVisibleReleaseStatusLog } from "./helper";

/**
 * Remove duplicate gitHead field when "lerna publish" fails.
 *
 * @param {String} path
 * @returns {void}
 */

export function removeGitHead(path: string) {
  const GIT_HEAD_REG = /,[\n\t\s]*"gitHead":\s"[^"]+"/;
  let content = readFileSync(path, "utf-8");
  content = content.replace(GIT_HEAD_REG, "");
  writeFileSync(path, content, "utf-8");
}

/**
 * Enter a interactive cli to know the current situation of `lerna publish`.
 *
 * @param {String} cwd
 * @param {String} version
 * @param {String} tag
 * @returns {Promise<void>}
 */

export async function patch(options: PatchNS.IOptions): Promise<void | never> {
  const { cwd, tag, runInBand = false, ignoreScripts = false } = options;

  let { version } = options;

  logger.info("Patch Started");

  if (!tag) {
    throw new Error('[MONO] "tag" is required for "patch"');
  }

  if (!version) {
    try {
      const config = resolveLernaConfig(cwd);
      version = config?.data.version;
    } catch (e) {
      // dot not handle it for now
    }
  }

  logger.info(`Version: ${chalk.cyan(version)}`);
  logger.info(`Tag: ${chalk.cyan(tag)}`);

  const pkgs = await resolvePackages({ cwd, tag });
  pkgs.forEach((pkg) => removeGitHead(join(pkg.path, "package.json")));

  if (pkgs.every((pkg) => pkg.version === version)) {
    return console.log(
      `${chalk.cyan("❯ ")}${chalk.gray(
        "[MONO]"
      )} Do not need "patch" since all packages've been published correctly! `
    );
  }

  const visibleReleaseStatusLog = getVisibleReleaseStatusLog(
    pkgs,
    version,
    tag
  );
  console.log(visibleReleaseStatusLog);

  const { yes } = await inquirer.prompt([
    {
      name: "yes",
      message: "Continue to patch",
      type: "list",
      choices: ["N", "Y"],
    },
  ]);

  if (yes === "Y") {
    const patchedPkgs = pkgs.filter((pkg) => pkg.version !== version);

    const releasePkg = async (pkg: NpmNS.IRemotePackageInfo) => {
      const commandCwd = join(cwd, `packages/${pkg.dirname}`);
      console.log(chalk.gray(`$ npm publish --tag ${tag} # ${commandCwd}`));
      const npmArgs = ["publish", "--tag", tag];
      if (ignoreScripts) {
        npmArgs.push("--ignore-scripts");
      }
      await execa("npm", npmArgs, {
        // silent: true,
        stdio: "inherit",
        cwd: commandCwd,
      });
      console.log(`+ ${pkg.name}@${version}\n`);
    };

    if (runInBand) {
      for (const pkg of patchedPkgs) {
        await releasePkg(pkg);
      }
    } else {
      await Promise.all(patchedPkgs.map(releasePkg));
    }
  }
}
