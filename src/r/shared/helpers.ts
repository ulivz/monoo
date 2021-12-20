/**
 * Module dependencies
 */
import { existsSync, writeFileSync, unlinkSync } from 'fs-extra';
import { join } from 'path';
import execa from 'execa';
import { ReleaseNS } from '../types';

export { execa };

const LERNA_CONFIG = 'lerna.json';
const MONO_CONFIG = 'mono.json';

/**
 * Git push
 *
 * @returns {Promise<void>}
 */

export async function gitPush() {
  await execa('git', ['push'], { stdio: 'inherit' });
}

/**
 * Require json file with no cache
 *
 * @param {String} jsonPath
 * @returns {Promise<Object>}
 */

export function requireJson(jsonPath: string) {
  delete require.cache[jsonPath];
  const json = require(jsonPath);
  return json;
}

/**
 * Safely require json file with no cache
 *
 * @param {String} jsonPath
 * @returns {Promise<Object>}
 */
export function safelyRequireJson(jsonPath: string) {
  if (existsSync(jsonPath)) {
    return requireJson(jsonPath);
  }
  return {};
}

/**
 * Resolve content of `lerna.json` or `mono.json`
 *
 * @param {String} cwd
 * @returns {Object}
 */
export function resolveLernaConfig(cwd = process.cwd()): {
  path: string;
  data: ReleaseNS.ILernaConfig;
} {
  const lernaConfigPath = join(cwd, LERNA_CONFIG);
  if (existsSync(lernaConfigPath)) {
    return {
      path: lernaConfigPath,
      data: requireJson(lernaConfigPath),
    };
  }
  const monoConfigPath = join(cwd, MONO_CONFIG);
  if (existsSync(monoConfigPath)) {
    return {
      path: monoConfigPath,
      data: requireJson(monoConfigPath),
    };
  }
}

/**
 * Ensure lerna.json exists
 */
export function ensureLernaConfig(cwd: string) {
  const lernaConfig = resolveLernaConfig(cwd);
  if (lernaConfig.path.endsWith(MONO_CONFIG)) {
    writeFileSync(
      join(cwd, LERNA_CONFIG),
      JSON.stringify(lernaConfig.data, null, 2),
    );
  }
}

/**
 * Ensure that lerna.json does not exists when 'mono.json' exists.
 */
export function cleanLernaConfig(cwd: string) {
  const monoConfigPath = join(cwd, MONO_CONFIG);
  const lernaConfigPath = join(cwd, LERNA_CONFIG);
  if (existsSync(monoConfigPath)) {
    const lernaConfig = resolveLernaConfig(cwd);
    if (lernaConfig.path.endsWith(LERNA_CONFIG)) {
      writeFileSync(monoConfigPath, JSON.stringify(lernaConfig.data, null, 2));
      unlinkSync(lernaConfigPath);
    }
  }
}

/**
 *
 * Resolve content of `lerna.json`
 *
 * @param {String} cwd
 * @returns {Object}
 */

export function resolvePackageJson(cwd = process.cwd()) {
  const pkgJsonPath = join(cwd, 'package.json');
  return safelyRequireJson(pkgJsonPath);
}
