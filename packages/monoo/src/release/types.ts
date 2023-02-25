/**
 * Module dependencies
 */
import type { RequestInit } from "node-fetch";
import type urlJoin from "url-join";
import { IPackageJSON } from "@monoo/types"

/**
 * Shared namespace
 */
export namespace SharedNS {
  export interface IOptions {
    cwd?: string;
  }
}

/**
 * Release namespace
 */
export namespace ReleaseNS {
  export interface IModifyReleaseArgumentsContext {
    arguments: string[];
    version: string;
    tag: string;
  }

  export interface IReadyContext {
    cwd: string;
  }

  export interface IReleasedContext {
    cwd: string;
    version: string;
    tag: string;
  }

  export interface IPromptAnswers {
    bump: string;
    customVersion: string;
    npmTag: string;
    customNpmTag: string;
  }

  export interface IOptions extends SharedNS.IOptions {
    /**
     * Generate changelog or not.
     */
    changelog?: boolean;
    /**
     * Run in band or not.
     */
    runInBand?: boolean;
    /**
     * Ignore scripts, it will ignore the npm life cycle hooks (e.g. prepublishOnly).
     */
    ignoreScripts?: boolean;
    /**
     * Execute custom build script before release.
     *
     * It is recommended to run topological build before actual publishing process,
     * and then ignore the build script (with `ignoreScripts`) of each package during
     * actual publishing release.
     */
    build?: boolean | string;
    /**
     * Preview execution.
     */
    dryRun?: boolean;
    /**
     * @deprecated
     */
    ready?: (ctx: IReadyContext) => Promise<unknown>;
    /**
     * @deprecated
     */
    modifyReleaseArguments?: (ctx: IModifyReleaseArgumentsContext) => string[];
    /**
     * @deprecated
     */
    released?: (ctx: IReleasedContext) => Promise<unknown>;
  }
}

/**
 * Run namespace
 */
export namespace RunNS {
  export interface IOptions extends SharedNS.IOptions {
    commands: string[];
    runInBand: boolean;
    filter?(v: IPackageJSON): boolean;
    [key: string]: unknown;
  }
}

/**
 * Disttag namespace
 */
export namespace DistTagNS {
  export interface IOptions extends SharedNS.IOptions {
    distVersion: string;
    tag: string;
  }
}

/**
 * Path namespace
 */
export namespace PatchNS {
  export interface IOptions extends SharedNS.IOptions {
    version: string;
    tag: string;
    runInBand: boolean;
    ignoreScripts: boolean;
  }
}

/**
 * Dingding namespace
 */
export namespace DingdingNS {
  export interface IWebhook {
    name: string;
    webhook: string;
    secret: string;
  }

  export interface IOptions extends IWebhook {
    body?: {
      msgtype: "markdown";
      markdown: {
        title: string;
        text: string;
      };
    };
    example?: boolean;
  }

  export interface IWebhookConfig {
    /**
     * Webhooks to post
     */
    webhooks: DingdingNS.IWebhook[];
    /**
     * Test webhook
     */
    testWebhook?: DingdingNS.IWebhook;
    /**
     * Using test webhook or not
     */
    test?: boolean;
  }
}

/**
 * Yuque namespace
 */
export namespace YuqueNS {
  /**
   * Transformer context
   */
  export interface ITransformerContext {
    host: string;
    urlJoin: typeof urlJoin;
    transformerOptions: Record<string, unknown>;
    options: IOptions;
  }

  /**
   * Post data
   */
  export interface IYuquePostData {
    title: string;
    cover: string;
    description: string;
    custom_description: string;
    book: {
      namespace: string;
      user: {
        avatar_url: string;
      };
    };
    slug: string;
  }

  /**
   * Transformer
   */
  export type Transformer = (
    data: IYuquePostData,
    ctx: ITransformerContext
  ) => Record<string, unknown>;

  /**
   * Options
   */
  export interface IOptions
    extends SharedNS.IOptions,
      DingdingNS.IWebhookConfig {
    /**
     * Url of yuque post
     */
    url?: string;
    /**
     * Host of yuque
     * @default 'https://yuque.antfin-inc.com/api/v2'
     */
    host?: string;
    /**
     * Cover to post
     */
    cover?: string;
    /**
     * Endpoint of yuque open api
     */
    endpoint?: string;
    /**
     * Request options
     */
    options?: Partial<RequestInit>;
    /**
     * Transformer preset
     */
    transformerPreset?: "dingding-actionCard";
    /**
     * Transformer options
     */
    transformerOptions?: Record<string, unknown>;
    /**
     * Custom transformer
     */
    transformer?: Transformer;
    /**
     * Log response
     */
    log?: boolean;
  }
}

/**
 * changelog namespace
 */
export namespace ChangelogNS {
  export interface ICommitAuthorOptions {
    /**
     * Attach author to each changelog commit
     *
     * @default false
     */
    attachAuthor?: boolean;
    /**
     * Type of author name
     *
     * @default 'name'
     */
    authorNameType?: "name" | "email";
    /**
     * Get author remote page
     *
     * @param author
     */
    getAuthorPage?(author: ICommitAuthor): string;
  }

  export interface IOptions extends SharedNS.IOptions, ICommitAuthorOptions {
    /**
     * current Version
     *
     * @default version from lerna.json
     */
    version?: string;
    /**
     * Beautify changelog, Remove top-level useless header
     *
     * @see https://github.com/conventional-changelog/conventional-changelog/issues/376
     * @default false
     */
    beautify?: boolean;
    /**
     * Create changelog commit
     *
     * @default false
     */
    commit?: boolean;
    /**
     * Create git push action
     *
     * @default false
     */
    gitPush?: boolean;
  }
  /**
   * Commit author
   */
  export interface ICommitAuthor {
    /**
     * Commit author name
     */
    name: string;
    /**
     * Email name
     */
    emailName: string;
    /**
     * Full email
     */
    email: string;
  }
}

/**
 * PostChangelog namespace
 */
export namespace PostChangelogNS {
  /**
   * View all link
   */
  export interface IViewAll {
    text: string;
    url: string;
  }
  /**
   * Options to infer changelog
   */
  export interface IInferChangelogOptions
    extends SharedNS.IOptions,
      ChangelogNS.ICommitAuthorOptions {
    /**
     * Package name
     */
    packageName: string;
    /**
     * changelog file name
     *
     * @default 'CHANGELOG.md'
     */
    file?: string;
    /**
     * changelog preset, avilable presets: conventional-changelog、afx
     *
     * @default 'conventional-changelog'
     */
    preset?: string;
    /**
     * custom changelog parser
     */
    parser?: (
      changelog: string,
      packageName: string
    ) => {
      title: string;
      content: string;
    };
    /**
     * view all config
     */
    viewAll?: IViewAll;
  }

  export interface IOptions
    extends IInferChangelogOptions,
      DingdingNS.IWebhookConfig {
    /**
     * Custom title, defaults to inferred title from changelog.
     */
    title?: string;
    /**
     * Custom content, defaults to inferred content from changelog.
     */
    content?: string;
  }
}

export type IConfig = ReleaseNS.IOptions & {
  verbose?: boolean;
  postChangelog?: PostChangelogNS.IOptions;
  yuque?: YuqueNS.IOptions;
  dingding?: DingdingNS.IOptions;
  patch?: PatchNS.IOptions;
  distTag?: DistTagNS.IOptions;
  run?: RunNS.IOptions;
};

export function defineConfig(config: IConfig): IConfig {
  return config;
}
