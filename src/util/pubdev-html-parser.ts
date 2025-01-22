import { Dependency } from "@jpfulton/license-auditor-common";
import { parse as parseHtml } from "node-html-parser";
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
 * @returns Extracted metadata including license, publisher, repository URL, etc.
 * @throws PubDevParseError if required metadata cannot be found
 */
export function parsePackageHtml(html: string): PubDevMetadata {
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
