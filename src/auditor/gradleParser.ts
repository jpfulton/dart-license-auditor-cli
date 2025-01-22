import { existsSync, readFileSync } from "fs";
import { GradleDependency, GradleDependencyReport } from "../models";

// returns a GradeDependencyReport object from a file name
export const getReportFromFile = (
  reportFile: string
): GradleDependencyReport => {
  const reportFileContent = getReportFileContent(reportFile);
  return getReportFromString(reportFileContent);
};

// returns an array of GradleDependency objects from a GradleDependencyReport object
// that was generated from a report file name
export const getDependenciesFromReportFile = (
  reportFile: string
): GradleDependency[] => {
  const report = getReportFromFile(reportFile);
  return report.dependencies;
};

// returns a GradleDependencyReport object from a string of file content
export const getReportFromString = (
  reportFileContent: string
): GradleDependencyReport => {
  return JSON.parse(reportFileContent) as GradleDependencyReport;
};

// returns a string of file content from a file name
const getReportFileContent = (reportFile: string): string => {
  if (!existsSync(reportFile)) {
    throw new Error(`Report file ${reportFile} does not exist.`);
  }

  return readFileSync(reportFile, "utf8");
};
