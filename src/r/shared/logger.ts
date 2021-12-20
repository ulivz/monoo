/**
 * Module dependencies
 */
import chalk from 'chalk';

const { name: ID } = require('../../../package.json');

const debug = require('debug')(ID);

function error(msg: string) {
  return console.log(
    `${chalk.cyan('❯ ')}${chalk.gray(ID)} ${chalk.red('error')} ${msg}`,
  );
}

function info(msg: string) {
  return console.log(`${chalk.cyan('❯ ')}${chalk.gray(ID)} 💬 ${msg}`);
}

function warn(msg: string) {
  return console.log(`${chalk.cyan('❯ ')}${chalk.gray(ID)} ⚠️  ${msg}`);
}

function enableDebug() {
  require('debug').enable(ID);
}

function disableDebug() {
  require('debug').disable(ID);
}

const logger = {
  info,
  warn,
  error,
  debug,
  enableDebug,
  disableDebug,
};

export { logger };
