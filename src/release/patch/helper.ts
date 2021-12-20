/**
 * Module dependencies
 */
import chalk from "chalk";
import boxen, { BorderStyle } from "boxen";
import textTable from "text-table";
import stringWidth from "string-width";
import { NpmNS } from "../types";

/**
 * Get visible release status log
 */
export function getVisibleReleaseStatusLog(
  pkgs: NpmNS.IRemotePackageInfo[],
  currentVersion: string,
  currentTag: string
) {
  const table = pkgs.map((pkg) => {
    if (pkg.version === currentVersion) {
      return [pkg.name, pkg.version, "Yes", "-"].map((v) => chalk.dim(v));
    }

    return [
      chalk.bold(chalk.red(pkg.name)),
      chalk.bold(chalk.red(pkg.version)),
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
