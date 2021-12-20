/**
 * Module dependencies
 */
import { join } from 'path';
import { existsSync } from 'fs';
import { NpmNS } from '../types';

export function resolvePkg(cwd: string): NpmNS.IPackageJSON {
  const pkgPath = join(cwd || process.cwd(), 'package.json');
  let pkg: NpmNS.IPackageJSON;
  if (existsSync(pkgPath)) {
    pkg = require(pkgPath);
  }
  return (pkg || {}) as NpmNS.IPackageJSON;
}
