import { Dependency } from "@jpfulton/license-auditor-common";
import { parse as parseHtml } from "node-html-parser";
import { fetchLicenseHtml } from "./pub-dev-fetcher";
import { ParsedDependency } from "./yaml-parser";

export interface PubDevMetadata {
  license: {
    type: string;
    url: string;
  };
  publisher?: string;
  repository?: string;
  homepage?: string;
}

export class PubDevParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PubDevParseError";
  }
}

/**
 * Parse pub.dev HTML content to extract package metadata
 * @param html The HTML content from pub.dev
 * @param packageName The name of the package (required for fetching license info if needed)
 * @param version The version of the package (required for fetching license info if needed)
 * @returns Extracted metadata including license, publisher, repository URL, etc.
 * @throws PubDevParseError if required metadata cannot be found
 */
export async function parsePackageHtml(
  html: string,
  packageName: string,
  version: string
): Promise<PubDevMetadata> {
  const root = parseHtml(html);
  const metadata: PubDevMetadata = {
    license: { type: "", url: "" },
  };

  // Find the detail-info-box which contains all metadata
  const infoBox = root.querySelector("aside.detail-info-box");
  if (!infoBox) {
    throw new PubDevParseError("Could not find package metadata section");
  }

  // Extract license information
  const licenseSection = infoBox.querySelector(
    "h3.title:contains('License') + p"
  );
  if (licenseSection) {
    // License type is the text content before the link
    const licenseText = licenseSection.text.trim();
    metadata.license.type = licenseText.split("(")[0].trim();

    // License URL is in the anchor tag
    const licenseLink = licenseSection.querySelector("a");
    if (licenseLink) {
      metadata.license.url = new URL(
        licenseLink.getAttribute("href") || "",
        "https://pub.dev"
      ).toString();

      // If license type is unknown, try to get it from the license page
      if (metadata.license.type.toLowerCase() === "unknown") {
        try {
          const licenseHtml = await fetchLicenseHtml(packageName, version);
          metadata.license.type = parseLicenseHtml(licenseHtml);
        } catch (error) {
          console.warn(
            `Failed to fetch license text for ${packageName}@${version}: ${
              (error as Error).message
            }`
          );
          // Keep the "unknown" type if we can't fetch the license text
        }
      }
    }
  } else {
    throw new PubDevParseError("Could not find license information");
  }

  // Extract publisher information
  const publisherSection = infoBox.querySelector(
    "h3.title:contains('Publisher') + p"
  );
  if (publisherSection) {
    const publisherLink = publisherSection.querySelector("a");
    if (publisherLink) {
      metadata.publisher = publisherLink.text.trim();
    }
  }

  // Extract repository URL - look for Repository link first
  const links = infoBox.querySelectorAll("a.link");
  for (const link of links) {
    const text = link.text.trim().toLowerCase();
    const href = link.getAttribute("href");

    if (text.includes("repository") && href) {
      metadata.repository = href;
      break;
    }
  }

  // If no explicit repository link found, look for any source control URLs
  if (!metadata.repository) {
    for (const link of links) {
      const href = link.getAttribute("href") || "";
      // Check for common source control hosting services
      if (href.match(/github\.com|gitlab\.com|bitbucket\.org|git\./i)) {
        metadata.repository = href;
        break;
      }
    }
  }

  // Extract homepage (first external link that's not the repository)
  for (const link of links) {
    const href = link.getAttribute("href");
    if (href && href !== metadata.repository && !href.startsWith("/")) {
      metadata.homepage = href;
      break;
    }
  }

  return metadata;
}

/**
 * Convert a parsed dependency and pub.dev metadata into a Dependency object
 * @param parsedDep The dependency information from pubspec.yaml
 * @param metadata The metadata extracted from pub.dev
 * @param rootProjectName The name of the root project
 * @returns A Dependency object with combined information
 */
export function convertToDependency(
  parsedDep: ParsedDependency,
  metadata: PubDevMetadata,
  rootProjectName: string
): Dependency {
  return {
    rootProjectName,
    name: parsedDep.name,
    version: parsedDep.version || "",
    licenses: [
      {
        license: metadata.license.type,
        url: metadata.license.url,
      },
    ],
    publisher: metadata.publisher || "",
    repository: metadata.repository || "",
  };
}

/**
 * Parse the license HTML content from pub.dev to extract the first line of the license text
 * @param html The HTML content from the pub.dev license page
 * @returns The first line of the license text
 * @throws PubDevParseError if the license text cannot be found
 */
export function parseLicenseHtml(html: string): string {
  const root = parseHtml(html);

  // Find the pre element containing the license text using a specific selector
  const preElement = root.querySelector(
    "section.tab-content.detail-tab-license-content .highlight pre"
  );
  if (!preElement) {
    throw new PubDevParseError("Could not find license text");
  }

  // Get the text content and split into lines
  const text = preElement.text.trim();
  if (!text) {
    throw new PubDevParseError("Could not find license text");
  }

  // Get the first non-empty line
  const lines = text.split("\n");
  const firstLine = lines.find((line) => line.trim().length > 0);
  if (!firstLine) {
    throw new PubDevParseError("Could not find license text");
  }

  return firstLine.trim();
}
