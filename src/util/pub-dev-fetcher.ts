import fetch from "node-fetch";
import { parseVersion, VersionParseError } from "./version-parser";
import { ParsedDependency } from "./yaml-parser";

const PUB_DEV_BASE_URL = "https://pub.dev/packages";

export class PubDevFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PubDevFetchError";
  }
}

/**
 * Fetches the HTML content for a package from pub.dev
 * @param packageName The name of the package
 * @param version The version string (can include constraints like ^)
 * @returns The HTML content as a string
 * @throws PubDevFetchError if the fetch fails or version is invalid
 */
export async function fetchPackageHtml(
  packageName: string,
  version: string
): Promise<string> {
  try {
    const cleanVersion = parseVersion(version);
    const url = `${PUB_DEV_BASE_URL}/${packageName}/versions/${cleanVersion}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new PubDevFetchError(
        `Failed to fetch package info. Status: ${response.status}`
      );
    }
    return await response.text();
  } catch (error) {
    if (error instanceof VersionParseError) {
      throw new PubDevFetchError(
        `Invalid version format for ${packageName}: ${error.message}`
      );
    }
    throw new PubDevFetchError(
      `Error fetching package info: ${(error as Error).message}`
    );
  }
}

/**
 * Fetches the HTML content for a package from pub.dev using a ParsedDependency
 * @param dependency The parsed dependency object
 * @returns The HTML content as a string
 * @throws PubDevFetchError if the fetch fails or if the dependency is not valid
 */
export async function fetchPackageHtmlFromDependency(
  dependency: ParsedDependency
): Promise<string> {
  if (!dependency.version) {
    throw new PubDevFetchError(
      `Cannot fetch package info for ${dependency.name}: no version specified`
    );
  }

  return fetchPackageHtml(dependency.name, dependency.version);
}
