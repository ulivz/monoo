/**
 * Module dependencies
 */
import { chalk, MonorepoBuilder, styled } from "@monoo/shared";
import { IDOptions } from "./types";

/**
 * Quickly launch on-demand development build for monorepo.
 */
export function dev(opts: IDOptions = {}) {
  opts = {
    cwd: process.cwd(),
    ...opts,
  };

  const builder = new MonorepoBuilder(opts);
  builder.bootstrap();
  builder.watch();
  builder.enableStdinFeature();
  console.log();
  console.log(
    `  ${styled(`[MONOO]`)} Development mode ${chalk.gray(
      `(modify code to create builder or enter ${styled(
        "n"
      )} to create builder manually.)`
    )}`
  );
  console.log();
}
