import { readFileSync } from "fs";
import path from "path";
import { parseYamlFile } from "./yaml-parser";

// return the version string from this module's package.json
export function getCurrentVersionString() {
  try {
    const packageJson = JSON.parse(
      readFileSync(`${__dirname}/../../../package.json`).toString()
    );
    const version = packageJson?.version ?? "UNKNOWN";
    return version;
  } catch (e) {
    // this error happens when running the tests
    // which have a different path relationship to the package.json file
    return "UNKNOWN";
  }
}

/**
 * Get the root project name from a Dart/Flutter project.
 * Primary method: Parse the pubspec.yaml file to get the official package name.
 * Fallback method: Use the directory name if pubspec.yaml doesn't exist or can't be parsed.
 * @param pathToProject Optional path to the Dart/Flutter project root. If not provided, uses current working directory.
 * @returns The project name
 */
export function getRootProjectName(pathToProject?: string): string {
  const projectPath = pathToProject ?? process.cwd();

  try {
    const pubspecPath = path.join(projectPath, "pubspec.yaml");
    const pubspec = parseYamlFile(pubspecPath);
    return pubspec.name;
  } catch (e) {
    // Fallback to directory name if pubspec.yaml doesn't exist or can't be parsed
    return path.basename(projectPath);
  }
}
