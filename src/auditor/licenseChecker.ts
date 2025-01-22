import {
  Configuration,
  Dependency,
  DependencyOutputter,
  MetadataOutputter,
  removeDuplicates,
} from "@jpfulton/license-auditor-common";
import { existsSync } from "fs";
import { getRootProjectName, isGradleProject, isMavenProject } from "../util";
import {
  convertGradleDependencies,
  convertMavenDependencies,
} from "../util/converters";
import { getDependenciesFromReportFile } from "./gradleParser";
import {
  getMavenDependenciesFromRootNode,
  getReportRootNode,
} from "./mavenParser.js";
import { parserFactory } from "./parseLicenses.js";

export const findAllDependencies = (projectPath: string): Dependency[] => {
  const isMaven = isMavenProject(projectPath);
  const isGradle = isGradleProject(projectPath);

  if (!isMaven && !isGradle) {
    throw new Error("The project is not a Maven or Gradle project.");
  }

  const rootProjectName = getRootProjectName(projectPath);
  let dependencies: Dependency[] = [];

  if (isMaven) {
    let pathToReport = `${projectPath}/target/reports/dependencies.html`;
    if (!existsSync(pathToReport)) {
      pathToReport = `${projectPath}/target/site/dependencies.html`;
      if (!existsSync(pathToReport)) {
        throw new Error(
          "No Maven dependencies report found at either modern (/target/reports/) or legacy (/target/site/) paths."
        );
      }
    }

    const rootNode = getReportRootNode(pathToReport);
    const mavenDependencies = getMavenDependenciesFromRootNode(rootNode);

    dependencies = convertMavenDependencies(mavenDependencies, rootProjectName);
  }

  if (isGradle) {
    let pathToReport = "";
    if (existsSync(`${projectPath}/build/licenses/licenses.json`)) {
      pathToReport = `${projectPath}/build/licenses/licenses.json`;
    } else if (existsSync(`${projectPath}/licenses/licenses.json`)) {
      pathToReport = `${projectPath}/licenses/licenses.json`;
    } else {
      throw new Error("No license report found.");
    }

    const gradleDependencies = getDependenciesFromReportFile(pathToReport);

    dependencies = convertGradleDependencies(
      gradleDependencies,
      rootProjectName
    );
  }

  // remove duplicates
  dependencies = removeDuplicates(dependencies);

  // sort by name
  dependencies.sort((a, b) => a.name.localeCompare(b.name));

  return dependencies;
};

export const checkLicenses = (
  configuration: Configuration,
  projectPath: string,
  metadataOutputter: MetadataOutputter,
  infoOutputter: DependencyOutputter,
  warnOutputter: DependencyOutputter,
  errorOutputter: DependencyOutputter
) => {
  if (!projectPath) {
    return console.error("No project path provided.");
  }

  try {
    const dependencies = findAllDependencies(projectPath);

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
