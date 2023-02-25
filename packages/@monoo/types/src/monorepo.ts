/**
 * A interface to describe a package under monorepo.
 */

export interface IPackageJSON {
  name: string;
  version: string;
  workspaces?: string[];
  private?: boolean;
  [key:string]:any;
}

export interface IMonorepoPackage {
  key: string;
  relative: string;
  dir: string;
  name: string;
  version: string;
  packageJson: IPackageJSON;
}

export interface IMonorepoPackageWithRemoteInfo extends IMonorepoPackage {
  remoteVersion: string;
}