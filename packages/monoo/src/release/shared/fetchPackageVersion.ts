/**
 * Module dependencies
 */
import { execa } from "@monoo/shared";

/**
 * Fetch package version
 */
export async function fetchPackageVersion(name: string, tag: string) {
  try {
    return (
      await execa("npm", ["view", `${name}@${tag}`, "version"])
    ).stdout.toString();
  } catch (e) {
    console.log(e);
    return "- (1st release)";
  }
}
