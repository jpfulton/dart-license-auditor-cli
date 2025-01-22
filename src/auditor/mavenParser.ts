import { existsSync, readFileSync } from "fs";
import { HTMLElement, parse } from "node-html-parser";
import { MavenDependency, MavenLicense } from "../models";

// returns the root HTML node of the report file
export const getReportRootNode = (reportFile: string): HTMLElement => {
  if (!existsSync(reportFile)) {
    throw new Error(
      `Report file ${reportFile} does not exist. Ensure that the report file is generated using the command: 'mvn project-info-reports:dependencies'.`
    );
  }

  const reportFileContent = readFileSync(reportFile, "utf8");
  // parse and set root node to html tag
  return parse(reportFileContent).querySelector("html")!;
};

// returns an array of h3 elements
// these elements contain the scope of dependencies when followed by a dependency table
export const getH3Elements = (rootNode: HTMLElement): HTMLElement[] => {
  return rootNode.querySelectorAll("h3");
};

// get scope from h3 element
// the h3 element contains the scope of the dependencies
// the scope is the text of the h3 element
export const getScopeFromH3Element = (h3Element: HTMLElement): string => {
  return h3Element.text;
};

// returns an array of tables
// these tables contain the dependencies
export const getDependencyTables = (rootNode: HTMLElement): HTMLElement[] => {
  const tableArray = rootNode.querySelectorAll("table");
  const result: HTMLElement[] = [];

  // Check for both modern and legacy table formats
  tableArray.forEach((table) => {
    const firstRow = table.querySelectorAll("tr")[0];
    if (!firstRow) return;

    const thArray = firstRow.querySelectorAll("th");
    // Check if it's a dependency table by verifying column count and headers
    if (
      thArray.length === 5 &&
      thArray[0].text.includes("GroupId") &&
      thArray[1].text.includes("ArtifactId")
    ) {
      result.push(table);
    }
  });

  return result;
};

// get MavenDependency object from a table row
export const getMavenDependencyFromRow = (
  scope: string,
  row: HTMLElement
): MavenDependency => {
  const tdArray = row.querySelectorAll("td");

  const result: MavenDependency = {
    groupId: tdArray[0].text,
    artifactId: getArtifactIdFromCell(tdArray[1]),
    url: getProjectUrlFromCell(tdArray[1]),
    version: tdArray[2].text,
    type: tdArray[3].text,
    scope: scope,
    licenses: getMavenLicensesFromCell(tdArray[4]),
  };

  return result;
};

// get artifactId from table cell
// the cell may contain a link to the artifact or just the artifactId as text
export const getArtifactIdFromCell = (cell: HTMLElement): string => {
  const linkArray = cell.querySelectorAll("a");
  if (linkArray.length === 0) {
    return cell.text;
  } else {
    return linkArray[0].text;
  }
};

// get project url from table cell
// the cell may contain a link to the project or only text
// if only text is present, return undefined
export const getProjectUrlFromCell = (
  cell: HTMLElement
): string | undefined => {
  const linkArray = cell.querySelectorAll("a");
  if (linkArray.length === 0) {
    return undefined;
  } else {
    return linkArray[0].attributes.href;
  }
};

// get MavenLicense objects from cell content
// each cell contains zero or more links to licenses
// each license is represented by a separate link tag
// the link tag contains the name of the license
export const getMavenLicensesFromCell = (cell: HTMLElement): MavenLicense[] => {
  const result: MavenLicense[] = [];

  const linkArray = cell.querySelectorAll("a");
  linkArray.forEach((link) => {
    const license: MavenLicense = {
      name: link.text,
      url: link.attributes.href,
    };
    result.push(license);
  });

  return result;
};

// get MavenDependency objects from a root node
// the root node contains h3 elements which contain the scope of the dependencies
// followed (after other tags and text) by tables which contain the dependencies
// however, not all h3 elements are followed by a table
// so we need to check if a table is present after the h3 element
export const getMavenDependenciesFromRootNode = (
  rootNode: HTMLElement
): MavenDependency[] => {
  const result: MavenDependency[] = [];

  const scopeHeaders = getScopeHeaders(rootNode);
  const tableArray = getDependencyTables(rootNode);

  tableArray.forEach((table, index) => {
    // Get scope from corresponding header
    const scope = getScopeFromHeader(scopeHeaders[index]);
    const trArray = table.querySelectorAll("tr");
    trArray.shift(); // Skip header row

    trArray.forEach((tr) => {
      const mavenDependency = getMavenDependencyFromRow(scope, tr);
      result.push(mavenDependency);
    });
  });

  return result;
};

export const getScopeFromHeader = (headerElement: HTMLElement): string => {
  if (!headerElement) {
    return ""; // Return empty string for undefined headers
  }
  const text = headerElement.text.trim();
  return text.includes(" ") ? text.split(" ").pop()! : text;
};

// returns an array of scope header elements (h2 or h3)
export const getScopeHeaders = (rootNode: HTMLElement): HTMLElement[] => {
  // Try new format first (h2)
  const h2Elements = rootNode.querySelectorAll("h2");
  if (h2Elements.length > 0) {
    return h2Elements;
  }
  // Fall back to old format (h3)
  return rootNode.querySelectorAll("h3");
};
