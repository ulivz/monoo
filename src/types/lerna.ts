export interface ILernaConfig {
  version: string;
  packages: string[];
  [key: string]: unknown;
}
