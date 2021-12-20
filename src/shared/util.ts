/**
 * Module dependencies
 */
import * as path from 'path';
import globby from 'globby';
import { IMonorepoPackage } from '../types';

/**
 * Safely load package.json
 */
export function requirePkg(cwd: string): Record<string, any> {
  try {
    return require(`${cwd}/package.json`);
  } catch (_) {
    return {};
  }
}

/**
 * Load lerna.json
 */
export function loadMonorepoConfig(cwd: string) {
  try {
    return require(`${cwd}/lerna.json`);
  } catch (_) {
    return requirePkg(cwd);
  }
}

/**
 * Load monorepo.
 */
export function loadMonorepoPackages(
  cwd: string = process.cwd(),
): IMonorepoPackage[] {
  const packages = loadMonorepoConfig(cwd).packages || [];

  const resolved = globby.sync(packages, { cwd, onlyDirectories: true });

  return resolved.map((relative) => {
    const dir = path.join(cwd, relative);
    const key = relative.slice(relative.lastIndexOf('/') + 1);
    const packageJson = requirePkg(dir);
    const { name } = packageJson;
    const { version } = packageJson;
    return {
      key,
      relative,
      dir,
      name,
      version,
      packageJson,
    };
  });
}
