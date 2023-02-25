/**
 * Module dependencies
 */
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import { fetchPackageVersion, logger } from "../shared";
import { PatchNS } from "../types";
import { getVisibleReleaseStatusLog } from "./helper";
import { IMonorepoPackageWithRemoteInfo } from "@monoo/types";
import {
  chalk,
  execa,
  resolveLernaConfig,
  loadMonorepoPackages,
} from "@monoo/shared";

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
    throw new Error('[MONOO] "tag" is required for "patch"');
  }

  const lernaConfig = resolveLernaConfig(cwd).data;

  if (!version) {
    try {
      version = lernaConfig?.version;
    } catch (e) {
      // dot not handle it for now
    }
  }

  logger.info(`Version: ${chalk.cyan(version)}`);
  logger.info(`Tag: ${chalk.cyan(tag)}`);

  const pkgs = await loadMonorepoPackages(cwd, lernaConfig);
  pkgs.forEach((pkg) => removeGitHead(join(pkg.dir, "package.json")));

  if (pkgs.every((pkg) => pkg.version === version)) {
    return console.log(
      `${chalk.cyan("❯ ")}${chalk.gray(
        "[MONOO]"
      )} Do not need "patch" since all packages've been published correctly! `
    );
  }

  const remotePkgs: IMonorepoPackageWithRemoteInfo[] = await Promise.all(
    pkgs.map<Promise<IMonorepoPackageWithRemoteInfo>>(async (pkg) => {
      return {
        ...pkg,
        remoteVersion: await fetchPackageVersion(pkg.name, tag),
      };
    })
  );

  const visibleReleaseStatusLog = getVisibleReleaseStatusLog(
    remotePkgs,
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
    const patchedPkgs = remotePkgs.filter(
      (pkg) => pkg.remoteVersion !== version
    );

    const releasePkg = async (pkg: IMonorepoPackageWithRemoteInfo) => {
      const commandCwd = join(cwd, `packages/${pkg.dir}`);
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
