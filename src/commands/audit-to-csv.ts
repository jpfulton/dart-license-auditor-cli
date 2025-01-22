import {
  Dependency,
  getConfiguration,
  getConfigurationFromUrl,
} from "@jpfulton/license-auditor-common";
import { checkLicenses } from "../auditor";

export async function auditToCsv(
  pathToProject: string,
  options: { headers: boolean; data: boolean; remote: string }
): Promise<void> {
  const configuration = options.remote
    ? await getConfigurationFromUrl(options.remote)
    : await getConfiguration();

  if (options.headers) {
    console.log(
      `Project Name,Audit Status,Package Name,Package Version,Package License,Package Publisher,Package Publisher Email,Package Repository,Package Module Path,Package License Path`
    );
  }

  if (options.data) {
    checkLicenses(
      configuration,
      pathToProject,
      metadataCsv,
      infoCsv,
      warnCsv,
      errorCsv
    );
  }
}

const metadataCsv = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _uniqueCount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _whitelistedCount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _warnCount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _blacklistedCount: number
  // eslint-disable-next-line @typescript-eslint/no-empty-function
) => {};

const infoCsv = (licenseObj: Dependency) => {
  return csv("OK", licenseObj);
};

const warnCsv = (licenseObj: Dependency) => {
  return csv("WARN", licenseObj);
};

const errorCsv = (licenseObj: Dependency) => {
  return csv("ERROR", licenseObj);
};

function csv(status: string, dependency: Dependency) {
  const licensesString = dependency.licenses
    .map((license) => license.license)
    .join(", ");
  const licensePath = dependency.licenses
    .map((license) => license.path)
    .join(", ");

  return `"${dependency.rootProjectName}",
"${status}",
"${dependency.name}",
"${dependency.version}",
"${licensesString}",
"${dependency.publisher ?? ""}",
"${dependency.email ?? ""}",
"${dependency.repository ?? ""}",
"${dependency.path}",
"${licensePath}"`.replace(/\n/g, ""); // remove newlines
}
