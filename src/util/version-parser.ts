/**
 * Represents errors that occur during version parsing
 */
export class VersionParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VersionParseError";
  }
}

/**
 * Extracts a clean version number from a version constraint string
 * Handles:
 * - Raw versions: "1.2.3"
 * - Caret syntax: "^1.2.3"
 * - Compatibility syntax: ">=1.2.3 <2.0.0"
 * - Any syntax: "any"
 * - Pre-release versions: "1.2.3-beta"
 * - Build metadata: "1.2.3+build.123"
 *
 * @param versionString The version string to parse
 * @returns The cleaned version number
 * @throws VersionParseError if the version string cannot be parsed
 */
export function parseVersion(versionString: string): string {
  // Handle "any" version
  if (versionString.toLowerCase() === "any") {
    throw new VersionParseError(
      'Cannot determine specific version from "any" constraint'
    );
  }

  // Remove caret prefix if present
  if (versionString.startsWith("^")) {
    versionString = versionString.substring(1);
  }

  // Handle version range syntax (take the minimum version)
  if (versionString.includes(" ")) {
    const parts = versionString.split(" ");
    for (const part of parts) {
      if (part.startsWith(">=")) {
        versionString = part.substring(2);
        break;
      }
    }
  } else if (versionString.startsWith(">=")) {
    versionString = versionString.substring(2);
  }

  // Validate the remaining version string
  // Core version: 1.2.3
  // Optional pre-release: -alpha.1
  // Optional build metadata: +build.123
  const versionPattern =
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
  if (!versionPattern.test(versionString)) {
    throw new VersionParseError(`Invalid version format: ${versionString}`);
  }

  return versionString;
}

/**
 * Validates if a version string is in the correct format for pub.dev URLs
 * @param version The version string to validate
 * @returns true if the version is valid, false otherwise
 */
export function isValidPubDevVersion(version: string): boolean {
  try {
    parseVersion(version);
    return true;
  } catch (error) {
    return false;
  }
}
