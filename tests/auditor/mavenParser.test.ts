import { parse } from "node-html-parser";
import {
  getArtifactIdFromCell,
  getDependencyTables,
  getMavenDependenciesFromRootNode,
  getMavenDependencyFromRow,
  getMavenLicensesFromCell,
  getProjectUrlFromCell,
  getReportRootNode,
  getScopeFromHeader,
  getScopeHeaders,
} from "../../src/auditor/mavenParser.js";

describe("getArtifactIdFromCell", () => {
  it("returns the artifactId from the cell", () => {
    const cell = parse(
      '<td><a href="https://www.google.com">artifactId</a></td>'
    );
    const result = getArtifactIdFromCell(cell);
    expect(result).toEqual("artifactId");
  });
});

describe("getMavenLicensesFromCell", () => {
  it("returns an array of MavenLicense objects", () => {
    const cell = parse(
      '<td><a href="https://www.google.com">license1</a><br/><a href="https://www.google.com">license2</a></td>'
    );
    const result = getMavenLicensesFromCell(cell);
    expect(result).toEqual([
      {
        name: "license1",
        url: "https://www.google.com",
      },
      {
        name: "license2",
        url: "https://www.google.com",
      },
    ]);
  });
});

describe("getProjectUrlFromCell", () => {
  it("returns the project url from the cell", () => {
    const cell = parse(
      '<td><a href="https://www.google.com">artifactId</a></td>'
    );
    const result = getProjectUrlFromCell(cell);
    expect(result).toEqual("https://www.google.com");
  });
});

describe("getDependencyTables", () => {
  it("returns an array of tables", () => {
    const rootNode = parse(
      "<html><body><table><tr><th>GroupId</th><th>ArtifactId</th><th>Version</th><th>Type</th><th>Licenses</th></tr></table></body></html>"
    );
    const result = getDependencyTables(rootNode);
    expect(result.length).toEqual(1);
  });
});

describe("getMavenDependenciesFromRootNode", () => {
  it("returns an array of MavenDependency objects", () => {
    const rootNode = parse(
      `<html>
        <body>
          <h2>Project Dependencies compile</h2>
          <table>
          <tr>
            <th>GroupId</th>
            <th>ArtifactId</th>
            <th>Version</th>
            <th>Type</th>
            <th>Licenses</th>
          </tr>
          <tr>
            <td>groupId</td>
            <td><a href='https://www.google.com'>artifactId</a></td>
            <td>version</td>
            <td>type</td>
            <td>
              <a href='https://www.google.com'>license1</a><br/>
              <a href='https://www.google.com'>license2</a>
            </td>
          </tr>
          </table>
        </body>
      </html>`
    );
    const result = getMavenDependenciesFromRootNode(rootNode);
    expect(result).toEqual([
      {
        groupId: "groupId",
        artifactId: "artifactId",
        url: "https://www.google.com",
        version: "version",
        type: "type",
        scope: "compile",
        licenses: [
          {
            name: "license1",
            url: "https://www.google.com",
          },
          {
            name: "license2",
            url: "https://www.google.com",
          },
        ],
      },
    ]);
  });
});

describe("getMavenDependencyFromRow", () => {
  it("returns a MavenDependency object", () => {
    const scope = "compile";
    const row = parse(
      "<tr><td>groupId</td><td><a href='https://www.google.com'>artifactId</a></td><td>version</td><td>type</td><td><a href='https://www.google.com'>license1</a><br/><a href='https://www.google.com'>license2</a></td></tr>"
    );
    const result = getMavenDependencyFromRow(scope, row);
    expect(result).toEqual({
      groupId: "groupId",
      artifactId: "artifactId",
      url: "https://www.google.com",
      version: "version",
      type: "type",
      scope: "compile",
      licenses: [
        {
          name: "license1",
          url: "https://www.google.com",
        },
        {
          name: "license2",
          url: "https://www.google.com",
        },
      ],
    });
  });
});

describe("getReportRootNode", () => {
  it("returns the root node of the report file", () => {
    const reportFile = "tests/fixtures/dependencies_snowflake-jdbc.html";
    const result = getReportRootNode(reportFile);

    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    expect(result).toHaveProperty("tagName", "HTML");
  });
});

describe("getScopeHeaders", () => {
  it("returns h2 elements for modern format", () => {
    const rootNode = parse("<html><body><h2>test</h2></body></html>");
    const result = getScopeHeaders(rootNode);
    expect(result.length).toEqual(1);
    expect(result[0].tagName).toEqual("H2");
  });

  it("falls back to h3 elements for legacy format", () => {
    const rootNode = parse("<html><body><h3>compile</h3></body></html>");
    const result = getScopeHeaders(rootNode);
    expect(result.length).toEqual(1);
    expect(result[0].tagName).toEqual("H3");
  });
});

describe("getScopeFromHeader", () => {
  it("extracts scope from header text", () => {
    const header = parse("<h2>Project Dependencies test</h2>");
    const result = getScopeFromHeader(header);
    expect(result).toEqual("test");
  });

  it("handles simple scope text", () => {
    const header = parse("<h3>compile</h3>");
    const result = getScopeFromHeader(header);
    expect(result).toEqual("compile");
  });
});
