/**
 * Module dependencies
 */
import { loadConfig } from '@speedy-js/config-loader';
import { IUserConfig } from '../types';

export async function loadUserConfig(cwd: string): Promise<{
  path?: string;
  data: IUserConfig;
}> {
  const loaded = await loadConfig<IUserConfig>({
    cwd,
    configKey: 'mono',
  });
  return loaded;
}
