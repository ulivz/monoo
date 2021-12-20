/**
 * Module dependencies
 */
import { readdirSync, existsSync } from 'fs';
import execa from 'execa';
import { join } from 'path';
import { NpmNS } from '../types';

/**
 * Fetch package version
 */
export async function fetchPackageVersion(name: string, tag: string) {
  try {
    return (
      await execa('npm', ['view', `${name}@${tag}`, 'version'])
    ).stdout.toString();
  } catch (e) {
    console.log(e);
    return '- (1st release)';
  }
}

/**
 * Resolve local packages.
 */
export function resolveLocalPackages({
  cwd = process.cwd(),
  packagesDir,
}: {
  cwd: string;
  packagesDir?: string;
}): NpmNS.IPackage[] {
  if (!packagesDir) {
    packagesDir = join(cwd, 'packages');
  }

  const PRIVATE_PACKAGES = ['.DS_Store'];
  return readdirSync(packagesDir)
    .filter((n) => !PRIVATE_PACKAGES.includes(n))
    .map((n) => ({
      dirname: n,
      pkgPath: join(packagesDir, n, 'package.json'),
    }))
    .filter((p) => existsSync(p.pkgPath))
    .map((p) => {
      const pkg = require(p.pkgPath);
      return {
        dirname: p.dirname,
        name: pkg.name,
        pkg,
      };
    })
    .filter((p) => !p.pkg.private);
}

/**
 * Retrieve packages informations
 */

export async function resolvePackages({
  cwd = process.cwd(),
  tag = 'latest',
}): Promise<NpmNS.IRemotePackageInfo[]> {
  const packagesDir = join(cwd, 'packages');
  const packages = resolveLocalPackages({ cwd, packagesDir });
  return Promise.all(
    packages.map(async (pkg) => ({
      name: pkg.name,
      dirname: pkg.dirname,
      version: await fetchPackageVersion(pkg.name, tag),
      path: join(packagesDir, pkg.dirname),
    })),
  );
}
