import {
  Configuration,
  Dependency,
  DependencyOutputter,
  MetadataOutputter,
  removeDuplicates,
} from "@jpfulton/license-auditor-common";
import { existsSync } from "fs";
import {
  convertToDependency,
  fetchPackageHtmlFromDependency,
  getAllDependencies,
  parsePackageHtml,
  parseYamlFile,
} from "../util";
import { parserFactory } from "./parseLicenses.js";

export const findAllDependencies = async (
  projectPath: string
): Promise<Dependency[]> => {
  const pubspecPath = `${projectPath}/pubspec.yaml`;
  if (!existsSync(pubspecPath)) {
    throw new Error("No pubspec.yaml found in project path.");
  }

  // Parse the pubspec.yaml file
  const pubspec = parseYamlFile(pubspecPath);
  const rootProjectName = pubspec.name;
  let dependencies: Dependency[] = [];

  const parsedDependencies = getAllDependencies(pubspec);

  // Fetch and process each dependency
  for (const dep of parsedDependencies) {
    try {
      if (dep.source === "pub" && dep.version) {
        const html = await fetchPackageHtmlFromDependency(dep);
        const metadata = parsePackageHtml(html);
        dependencies.push(convertToDependency(dep, metadata, rootProjectName));
      }
      // Skip non-pub dependencies for now
    } catch (error) {
      console.warn(
        `Warning: Could not process dependency ${dep.name}: ${
          (error as Error).message
        }`
      );
    }
  }

  // remove duplicates
  dependencies = removeDuplicates(dependencies);

  // sort by name
  dependencies.sort((a, b) => a.name.localeCompare(b.name));

  return dependencies;
};

export const checkLicenses = async (
  configuration: Configuration,
  projectPath: string,
  metadataOutputter: MetadataOutputter,
  infoOutputter: DependencyOutputter,
  warnOutputter: DependencyOutputter,
  errorOutputter: DependencyOutputter
): Promise<void> => {
  if (!projectPath) {
    return console.error("No project path provided.");
  }

  try {
    const dependencies = await findAllDependencies(projectPath);

    if (!dependencies || dependencies.length <= 0) {
      return console.error("No dependencies found.");
    }

    const parse = parserFactory(
      configuration,
      infoOutputter,
      warnOutputter,
      errorOutputter
    );

    const result = parse(dependencies);
    const {
      uniqueCount,
      whitelistedCount,
      warnCount,
      blacklistedCount,
      blackListOutputs,
      warnOutputs,
      whiteListOutputs,
    } = result;

    metadataOutputter(
      uniqueCount,
      whitelistedCount,
      warnCount,
      blacklistedCount
    );

    // construct outputs placing blacklisted first, then warnings, then whitelisted
    const outputs = [...blackListOutputs, ...warnOutputs, ...whiteListOutputs];
    outputs.forEach((output) => console.log(output));
  } catch (err) {
    console.error((err as Error).message);
  }
};

export default checkLicenses;
