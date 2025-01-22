import {
  getMavenDependenciesFromRootNode,
  getReportRootNode,
} from "../../src/auditor/mavenParser.js";

const snowflakeJdbcReportFile =
  "tests/fixtures/dependencies_snowflake-jdbc.html";

const modernMavenReportFile =
  "tests/fixtures/dependencies_modern-maven_lb-admin-backend.html";

describe("getMavenDependenciesFromRootNode", () => {
  it("returns an array of MavenDependency objects", () => {
    const rootNode = getReportRootNode(snowflakeJdbcReportFile);
    const result = getMavenDependenciesFromRootNode(rootNode);

    // expect the result to be an array
    expect(Array.isArray(result)).toEqual(true);
    // expect the result to contain more than one element
    expect(result.length).toBeGreaterThan(1);
  });

  it("handles modern maven report format", () => {
    const rootNode = getReportRootNode(modernMavenReportFile);
    const result = getMavenDependenciesFromRootNode(rootNode);

    expect(Array.isArray(result)).toEqual(true);
    expect(result.length).toBeGreaterThan(1);

    // Verify some known dependencies
    const testDeps = result.filter((dep) => dep.scope === "test");
    expect(testDeps.length).toBeGreaterThan(0);
  });
});
