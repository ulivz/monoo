/**
 * Module dependencies
 */
import { ChildProcess } from 'child_process';
import { IMonorepoPackage } from './monorepo';

export interface IMonorepoBuilderOptions {
  cwd?: string;
}

export interface IMonorepoBuilderWatchOptions {
  exclude?: string[];
}

export interface IMonorepoBuilderStdinOptions {
  exclude?: string[];
}

/**
 * A map to store build processes.
 */
export interface MonorepoBuilderProcessPool {
  [key: string]: ChildProcess;
}

/**
 * A map to store build promise.
 */
export interface MonorepoBuilderPromisePool {
  [key: string]: Promise<ChildProcess>;
}

/**
 * Expose `IMonorepoBuilder`
 */
export interface IMonorepoBuilder {
  packages: IMonorepoPackage[];
  createBuildProcess(pkg: IMonorepoPackage, script?: string): ChildProcess;
  bootstrap(): Promise<void>;
  watch(watchOptions?: IMonorepoBuilderWatchOptions): void;
  enableStdinFeature(stdinOptions?: IMonorepoBuilderStdinOptions): void;
}
