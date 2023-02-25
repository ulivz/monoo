/**
 * Module dependencies
 */
import { existsSync, writeFileSync, unlinkSync } from "fs-extra";
import * as path from "path";
import globby from "globby";
import { IMonorepoPackage, ILernaConfig, IPackageJSON } from "@monoo/types";
import { join } from "path";
import execa from "execa";

export { execa };

const LERNA_CONFIG = "lerna.json";
const MONOO_CONFIG = "monoo.json";

/**
 * Git push
 *
 * @returns {Promise<void>}
 */

export async function gitPush() {
  await execa("git", ["push"], { stdio: "inherit" });
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
 * Resolve content of `lerna.json` or `monoo.json`
 *
 * @param {String} cwd
 * @returns {Object}
 */
export function resolveLernaConfig(cwd = process.cwd()): {
  path: string;
  data: ILernaConfig;
} | null {
  const lernaConfigPath = join(cwd, LERNA_CONFIG);
  if (existsSync(lernaConfigPath)) {
    return {
      path: lernaConfigPath,
      data: requireJson(lernaConfigPath),
    };
  }
  const monoConfigPath = join(cwd, MONOO_CONFIG);
  if (existsSync(monoConfigPath)) {
    return {
      path: monoConfigPath,
      data: requireJson(monoConfigPath),
    };
  }
  throw new Error(`Missing lerna.json or monoo.json`);
}

/**
 * Ensure lerna.json exists
 */
export function ensureLernaConfig(cwd: string) {
  const lernaConfig = resolveLernaConfig(cwd);
  if (lernaConfig.path.endsWith(MONOO_CONFIG)) {
    writeFileSync(
      join(cwd, LERNA_CONFIG),
      JSON.stringify(lernaConfig.data, null, 2)
    );
  }
}

/**
 * Ensure that lerna.json does not exists when 'monoo.json' exists.
 */
export function cleanLernaConfig(cwd: string) {
  const monoConfigPath = join(cwd, MONOO_CONFIG);
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
  const pkgJsonPath = join(cwd, "package.json");
  return safelyRequireJson(pkgJsonPath);
}

/**
 * Safely load package.json
 */
export function requirePkg(cwd: string): IPackageJSON {
  try {
    return require(`${cwd}/package.json`);
  } catch (_) {
    return {} as IPackageJSON;
  }
}

/**
 * Load monorepo.
 */
export function loadMonorepoPackages(
  cwd: string = process.cwd(),
  lernaConfig?: ILernaConfig
): IMonorepoPackage[] {
  if (!lernaConfig) {
    lernaConfig = resolveLernaConfig(cwd).data;
  }
  const packages = lernaConfig.packages || [];
  const resolved = globby.sync(packages, { cwd, onlyDirectories: true });

  return resolved.map((relative) => {
    const dir = path.join(cwd, relative);
    const key = relative.slice(relative.lastIndexOf("/") + 1);
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
