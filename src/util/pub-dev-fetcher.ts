import fetch from "node-fetch";
import { parseVersion } from "./version-parser";
import { ParsedDependency } from "./yaml-parser";

const PUB_DEV_BASE_URL = "https://pub.dev/packages";

export class PubDevFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PubDevFetchError";
  }
}

/**
 * Fetches the HTML content for a package version from pub.dev
 * @param packageName The name of the package
 * @param version The version of the package
 * @returns The HTML content as a string
 * @throws PubDevFetchError if the fetch fails
 */
export async function fetchPackageHtml(
  packageName: string,
  version: string
): Promise<string> {
  const cleanVersion = parseVersion(version);
  const url = `${PUB_DEV_BASE_URL}/${packageName}/versions/${cleanVersion}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch from ${url} - Status: ${response.status}`);
      throw new PubDevFetchError(
        `Failed to fetch package info. Status: ${response.status}`
      );
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching from ${url}: ${(error as Error).message}`);
    throw new PubDevFetchError(
      `Error fetching package info: ${(error as Error).message}`
    );
  }
}

/**
 * Fetches the HTML content for a package version from pub.dev using a ParsedDependency
 * @param dependency The parsed dependency object
 * @returns The HTML content as a string
 * @throws PubDevFetchError if the fetch fails or if the dependency is not valid
 */
export async function fetchPackageHtmlFromDependency(
  dependency: ParsedDependency
): Promise<string> {
  if (dependency.source !== "pub") {
    throw new PubDevFetchError(
      `Cannot fetch package info for ${dependency.name}: only pub source dependencies can be fetched`
    );
  }

  if (!dependency.version) {
    throw new PubDevFetchError(
      `Cannot fetch package info for ${dependency.name}: no version specified`
    );
  }

  return fetchPackageHtml(dependency.name, dependency.version);
}
