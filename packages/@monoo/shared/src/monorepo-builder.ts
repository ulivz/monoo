/**
 * Module dependencies
 */
import chokidar from 'chokidar';
import { ChildProcess } from 'child_process';
import chalk from 'chalk';
import shelljs from 'shelljs';
import { loadMonorepoPackages, styled } from '.';
import {
  IMonorepoPackage,
  IMonorepoBuilder,
  IMonorepoBuilderOptions,
  MonorepoBuilderProcessPool,
  MonorepoBuilderPromisePool,
  IMonorepoBuilderWatchOptions,
  IMonorepoBuilderStdinOptions,
} from '@monoo/types';

/**
 * Expose `MonorepoBuilder`
 */
export class MonorepoBuilder implements IMonorepoBuilder {
  public buildProcessPool: MonorepoBuilderProcessPool;

  public buildPromisePool: MonorepoBuilderPromisePool;

  public pendingMessages: string[];

  packages: IMonorepoPackage[];

  constructor(private options: IMonorepoBuilderOptions) {
    this.buildProcessPool = {};
    this.buildPromisePool = {};
    this.pendingMessages = [];
  }

  /**
   * bootstrap builder
   */
  async bootstrap() {
    this.packages = loadMonorepoPackages(this.options.cwd);
    console.log('this.packages', this.packages);
  }

  /**
   * Watch packages
   */
  watch(options: IMonorepoBuilderWatchOptions = {}) {
    const watcher = chokidar.watch(this.options.cwd, {
      ignoreInitial: true,
      ignored: [/\/node_modules\//, /\/lib\//, /\/esm\//],
    });

    const excludedPackages = options.exclude || [];

    const hanldeFileUpdate = async (file: string) => {
      const targetPkg = this.packages.find((pkg) => {
        return file.startsWith(`${pkg.dir}/src`);
      });

      if (targetPkg && !excludedPackages.includes(targetPkg.name)) {
        this.createBuildProcess(targetPkg);
      }
    };

    watcher.on('change', hanldeFileUpdate);
  }

  /**
   * Create a build process.
   *
   * @param pkg
   * @param script
   */
  createBuildProcess(pkg: IMonorepoPackage, script?: string) {
    if (this.buildProcessPool[pkg.name]) {
      return;
    }

    if (!pkg.packageJson.scripts.dev) {
      console.log(
        chalk.bold(
          `  [WARN] ${styled(`[${pkg.name}]`)} does not have a dev script.`,
        ),
      );
      return;
    }

    console.log(
      chalk.bold(`  ${styled(`[${pkg.name}]`)} join the build process.`),
    );

    const ps = shelljs.exec(script || 'npm run dev', {
      // @ts-ignore
      async: true,
      cwd: pkg.dir,
      stdio: [0, 1, 2, 'ipc'],
    });

    if (typeof ps.code !== 'undefined' && ps.code !== 0) {
      console.log(
        chalk.bold(`  [WARN] ${styled(`[${pkg.name}]`)} build failed.`),
      );
    }

    this.buildProcessPool[pkg.name] = ps;
    return ps;
  }

  /**
   * watch process stdin
   */
  enableStdinFeature(options: IMonorepoBuilderStdinOptions = {}) {
    const excludedPackages = options.exclude || [];

    process.stdin &&
      process.stdin.on('data', async (chunk) => {
        const originalCommand = chunk.toString('utf-8') as string;
        let parsed = originalCommand.trim();

        if (parsed === 'ps') {
          console.log(
            Object.keys(this.buildProcessPool)
              .map((pkgName) => {
                const ps = this.buildProcessPool[pkgName];
                return `${chalk.gray(`${ps.pid}`)}\t${pkgName}`;
              })
              .join('\n'),
          );
        }

        this.pendingMessages.push(parsed);

        process.nextTick(async () => {
          if (this.pendingMessages.length !== 1) {
            this.pendingMessages = [];
            return;
          }

          parsed = this.pendingMessages[0];
          this.pendingMessages = [];

          if (parsed === 'n') {
            const choices = this.packages
              .filter((pkg) => {
                return (
                  !this.buildProcessPool[pkg.name] &&
                  !this.buildPromisePool[pkg.name] &&
                  !excludedPackages.includes(pkg.name)
                );
              })
              .map((pkg) => {
                return {
                  name: `${pkg.key} ${chalk.gray(`(${pkg.name}`)}`,
                  value: pkg.name,
                };
              });

            const prompt = require('inquirer').prompt({
              name: 'pkgName',
              message: 'Choose a package to build:',
              choices,
              type: 'list',
              default: choices[0],
            });

            const { pkgName } = await prompt;
            /**
             * Fixes: https://github.com/SBoudrias/Inquirer.js/issues/894
             */
            prompt.ui.close();
            prompt.ui.rl.input.resume();
            parsed = pkgName;
          }

          const matchedPkg = this.packages.find((pkg) => {
            return pkg.key === parsed || pkg.name === parsed;
          });

          if (matchedPkg) {
            this.createBuildProcess(matchedPkg);
          }
        });
      });
  }

  /**
   * Handle process exit
   */
  onProcessExit() {
    const exitHandler = () => {
      Object.keys(this.buildProcessPool).forEach((name) => {
        const ps = this.buildProcessPool[name] as ChildProcess;
        if (ps && ps.kill) {
          ps.kill();
          console.log(`Exit sub process ${name}`);
        }
      });
      process.removeListener('exit', exitHandler);
      process.removeListener('SIGINT', exitHandler);
    };

    // do something when app is closing
    process.on('exit', exitHandler);

    // catches ctrl+c event
    process.on('SIGINT', exitHandler);
  }
}
