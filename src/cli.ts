/**
 * Module dependencies
 */
import CAC from "cac";
import chalk from "chalk";
import { dev, release, patch, changelog } from "./index";

async function wrapCommand(
  command: Function,
  cliFlags: Record<string, unknown>
) {
  cliFlags.cwd = cliFlags.cwd || process.cwd();
  try {
    await command(cliFlags);
  } catch (e) {
    // console.log(e);
    console.log();
    process.exitCode = 1;
    console.log(chalk.red((e as unknown as Error).message));
    console.log();
  }
}

/**
 * Bootstrap mono cli.
 */
export function bootstrapCli() {
  const cli = CAC();
  const pkg = require("../package.json");

  cli.option("--cwd <cwd>", "Current working directory.");

  cli
    .command("d", `Quickly launch on-demand development build for monorepo.`)
    .alias("dev")
    .action((opts) => {
      return wrapCommand(dev, opts);
    });

  cli
    .command("r", `Release your monorepo.`)
    .option("--changelog", "Whether to generate changelog.")
    .option("--no-changelog", "Whether to ignore generate changelog.")
    .option("--dry-run", "Preview execution.")
    .option("--runInBand", "Whether to publish package in series.")
    .option("--build [build]", "Execute custom build script before release.")
    .option(
      "--ignore-scripts",
      "Ignore npm scripts under release and patch process."
    )
    .alias("release")
    .action((opts) => {
      opts = {
        changelog: true,
        ...opts,
      }
      return wrapCommand(release, opts);
    });

  cli
    .command("p", `Patch the failure of lerna release.`)
    .option("--version <version>", "Version (e.g. 1.0.0, 2.0.0-alpha.9)")
    .option("--tag <tag>", "Tag (e.g. latest、next、beta)")
    .option("--runInBand", "Whether to publish package in series.")
    .option("--ignore-scripts", "Ignore npm scripts under patch process.")
    .alias("patch")
    .action((opts) => {
      return wrapCommand(patch, opts);
    });

  cli
    .command("changelog", "Create changelog")
    .option(
      "--version <version>",
      'Version (e.g. 1.0.0, 2.0.0-alpha.9), defaults to version in "lerna.json"'
    )
    .option("--beautify", "beautify changelog or not, defaults to false")
    .option("--commit", "create git commit or not, defaults to false")
    .option("--gitPush", "execute git push or not, defaults to false")
    .option("--attachAuthor", "add author or not, defaults to false")
    .option(
      "--authorNameType <type>",
      "type of author name, available options: `name`, `email`, defaults to `name`"
    )
    .action((opts) => {
      return wrapCommand(changelog, opts);
    });

  cli.version(pkg.version);
  cli.help();
  cli.parse();
}
