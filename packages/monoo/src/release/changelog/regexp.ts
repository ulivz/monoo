/**
 * A regexp to match commit
 */
export const COMMIT_RE =
  /\(\[([a-z0-9]{7})\]\(([^()]*)\)\)([^\n()[]]*)?(\[@(.*)\]\(.*\))?/gm;
