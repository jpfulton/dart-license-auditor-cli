import { readFileSync } from "fs";
import { parse } from "yaml";

// Types for different dependency formats
export type DependencySpec =
  | string // Direct version: "^1.0.0"
  | { sdk: string } // SDK dependency: { sdk: "flutter" }
  | { git: GitDependency } // Git dependency
  | { path: string } // Path dependency
  | { hosted: HostedDependency }; // Hosted dependency

interface GitDependency {
  url: string;
  ref?: string;
}

interface HostedDependency {
  name: string;
  url: string;
  version?: string;
}

export interface PubspecYaml {
  name: string;
  description: string;
  version: string;
  dependencies: Record<string, DependencySpec>;
  dev_dependencies?: Record<string, DependencySpec>;
}

export interface ParsedDependency {
  name: string;
  version: string | null;
  source: "pub" | "sdk" | "git" | "path" | "hosted";
}

export function parseYamlFile(filePath: string): PubspecYaml {
  const fileContents = readFileSync(filePath, "utf8");
  return parse(fileContents) as PubspecYaml;
}

export function parseDependency(
  name: string,
  spec: DependencySpec
): ParsedDependency {
  // Handle string version (e.g., "^1.0.0")
  if (typeof spec === "string") {
    return {
      name,
      version: spec,
      source: "pub",
    };
  }

  // Handle SDK dependency (e.g., flutter: sdk: "flutter")
  if ("sdk" in spec) {
    return {
      name,
      version: null,
      source: "sdk",
    };
  }

  // Handle git dependency
  if ("git" in spec) {
    return {
      name,
      version: spec.git.ref || null,
      source: "git",
    };
  }

  // Handle path dependency
  if ("path" in spec) {
    return {
      name,
      version: null,
      source: "path",
    };
  }

  // Handle hosted dependency
  if ("hosted" in spec) {
    return {
      name,
      version: spec.hosted.version || null,
      source: "hosted",
    };
  }

  throw new Error(`Unknown dependency format for ${name}`);
}

// Helper function to get all dependencies
export function getAllDependencies(pubspec: PubspecYaml): ParsedDependency[] {
  const dependencies: ParsedDependency[] = [];

  // Process regular dependencies
  Object.entries(pubspec.dependencies).forEach(([name, spec]) => {
    dependencies.push(parseDependency(name, spec));
  });

  // Process dev dependencies if they exist
  if (pubspec.dev_dependencies) {
    Object.entries(pubspec.dev_dependencies).forEach(([name, spec]) => {
      dependencies.push(parseDependency(name, spec));
    });
  }

  return dependencies;
}
