/**
 * Module dependencies
 */
import chalk from 'chalk';

export function styled(msg: string): string {
  return chalk.bold(chalk.blueBright(msg));
}
