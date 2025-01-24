import {
  PubDevFetchError,
  fetchPackageHtml,
  fetchPackageHtmlFromDependency,
} from "./pub-dev-fetcher.js";
import {
  PubDevMetadata,
  PubDevParseError,
  convertToDependency,
  parsePackageHtml,
} from "./pubdev-html-parser.js";
import { getCurrentVersionString, getRootProjectName } from "./root-project.js";
import {
  VersionParseError,
  isValidPubDevVersion,
  parseVersion,
} from "./version-parser.js";
import {
  DependencySpec,
  ParsedDependency,
  PubspecYaml,
  getAllDependencies,
  parseDependency,
  parseYamlFile,
} from "./yaml-parser.js";

export {
  // pub-dev-fetcher exports
  PubDevFetchError,
  // pubdev-html-parser exports
  PubDevParseError,
  // version-parser exports
  VersionParseError,
  convertToDependency,
  fetchPackageHtml,
  fetchPackageHtmlFromDependency,
  getAllDependencies,
  // root-project exports
  getCurrentVersionString,
  getRootProjectName,
  isValidPubDevVersion,
  parseDependency,
  parsePackageHtml,
  parseVersion,
  // yaml-parser exports
  parseYamlFile,
};

export type {
  // yaml-parser types
  DependencySpec,
  ParsedDependency,

  // pubdev-html-parser types
  PubDevMetadata,
  PubspecYaml,
};
