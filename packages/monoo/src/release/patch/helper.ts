/**
 * Module dependencies
 */
import boxen, { BorderStyle } from "boxen";
import textTable from "text-table";
import stringWidth from "string-width";
import { IMonorepoPackageWithRemoteInfo } from '@monoo/types';
import { chalk } from '@monoo/shared';

/**
 * Get visible release status log
 */
export function getVisibleReleaseStatusLog(
  pkgs: IMonorepoPackageWithRemoteInfo[],
  currentVersion: string,
  currentTag: string
) {
  const table = pkgs.map((pkg) => {
    if (pkg.remoteVersion === currentVersion) {
      return [pkg.name, pkg.version, "Yes", "-"].map((v) => chalk.dim(v));
    }

    return [
      chalk.bold(chalk.red(pkg.name)),
      chalk.bold(chalk.red(pkg.remoteVersion)),
      chalk.bold(chalk.red("NO")),
      chalk.bold(chalk.red(currentVersion)),
    ];
  });

  table.unshift(
    [
      "Package Name",
      `Remote Version (tag: ${currentTag})`,
      "Published",
      "Expected Version",
    ].map((v) => chalk.dim(v))
  );

  return boxen(
    textTable(table, {
      stringLength: stringWidth,
    }),
    {
      borderStyle: BorderStyle.Round,
      padding: 1,
      dimBorder: true,
    }
  )
}
