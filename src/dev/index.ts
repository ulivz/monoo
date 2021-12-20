/**
 * Module dependencies
 */
import chalk from 'chalk';
import { IDOptions } from './types';
import { MonorepoBuilder, styled } from '../shared';

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
    `  ${styled(`[MONO]`)} Development mode ${chalk.gray(
      `(modify code to create builder or enter ${styled(
        'n',
      )} to create builder manually.)`,
    )}`,
  );
  console.log();
}
