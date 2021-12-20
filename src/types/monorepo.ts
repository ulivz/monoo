/**
 * A interface to describe a package under monorepo.
 */
export interface IMonorepoPackage {
  key: string;
  relative: string;
  dir: string;
  name: string;
  version: string;
  packageJson: Record<string, any>;
}
