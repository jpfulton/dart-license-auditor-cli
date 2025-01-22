import {
  Dependency,
  getConfiguration,
  getConfigurationFromUrl,
  getLicensesMarkdown,
} from "@jpfulton/license-auditor-common";
import { checkLicenses } from "../auditor";
import { getCurrentVersionString, getRootProjectName } from "../util";

export async function auditToMarkdown(
  pathToProject: string,
  options: { remote: string }
): Promise<void> {
  const rootProjectName = getRootProjectName(pathToProject);
  const version = getCurrentVersionString();

  const configuration = options.remote
    ? await getConfigurationFromUrl(options.remote)
    : await getConfiguration();

  console.log(`# Package Dependencies Audit Report: ${rootProjectName}`);
  console.log("");

  console.log(`> Generated at ${new Date().toUTCString()} <br />`);
  console.log(
    `> Generated using version ${version} of java-license-auditor-cli. <br />`
  );
  console.log(
    `> Configuration source used: ${configuration.configurationSource} <br />`
  );
  if (configuration.configurationSource !== "default") {
    console.log(
      `> Configuration source URL: ${configuration.configurationFileName}`
    );
  }
  console.log("");

  checkLicenses(
    configuration,
    pathToProject,
    metadataMarkdown,
    infoMarkdown,
    warnMarkdown,
    errorMarkdown
  );

  console.log("");
}

const metadataMarkdown = (
  uniqueCount: number,
  whitelistedCount: number,
  warnCount: number,
  blacklistedCount: number
) => {
  console.log(`## Metadata`);
  console.log(
    `| :hash: Unique Licenses | :green_circle: Whitelisted Licenses | :yellow_circle: Warned Licenses | :red_circle: Blacklisted Licenses |`
  );
  console.log(`|---|---|---|---|`);
  console.log(
    `| ${uniqueCount} | ${whitelistedCount} | ${warnCount} | ${blacklistedCount} |`
  );
  console.log("");

  markdownTableHeader();
};

const infoMarkdown = (licenseObj: Dependency) => {
  return markdown(":green_circle:", licenseObj);
};

const warnMarkdown = (licenseObj: Dependency) => {
  return markdown(":yellow_circle:", licenseObj);
};

const errorMarkdown = (licenseObj: Dependency) => {
  return markdown(":red_circle:", licenseObj);
};

const markdown = (icon: string, dependency: Dependency): string => {
  const licenseString = getLicensesMarkdown(dependency);
  const licensePath = dependency.licenses
    .map((license) => license.path)
    .join(", ");

  return `| ${icon} 
| ${dependency.name} 
| ${dependency.version} 
| ${licenseString} 
| ${dependency.publisher ?? ""} 
| ${dependency.email ?? ""} 
| ${dependency.repository ?? ""} 
| ${dependency.path || ""} 
| ${licensePath || ""} |`.replaceAll("\n", ""); // Remove newlines from the license text
};

const markdownTableHeader = () => {
  console.log("## Licenses");
  console.log("");
  console.log(
    "|  | NAME | VERSION | LICENSE | PUBLISHER | EMAIL | REPOSITORY | MODULE PATH | LICENSE PATH |"
  );
  console.log("|---|---|---|---|---|---|---|---|---|");
};
