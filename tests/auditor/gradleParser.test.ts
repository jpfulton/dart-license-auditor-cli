import {
  getDependenciesFromReportFile,
  getReportFromFile,
  getReportFromString,
} from "../../src/auditor/gradleParser.js";

describe("gradleParser", () => {
  describe("getReportFromFile", () => {
    it("should throw an error if the file does not exist", () => {
      expect(() => getReportFromFile("")).toThrow();
    });

    it("should return a GradleDependencyReport object if the file exists", () => {
      const report = getReportFromFile(
        "tests/fixtures/licenses_applicationinsights-java.json"
      );

      expect(report).toBeDefined();
      expect(report.dependencies).toBeDefined();
      expect(report.dependencies.length).toBeGreaterThan(0);

      expect(report.dependencies[0].moduleLicense).toBeDefined();
      expect(report.dependencies[0].moduleLicenseUrl).toBeDefined();
      expect(report.dependencies[0].moduleName).toBeDefined();
      expect(report.dependencies[0].moduleVersion).toBeDefined();
    });
  });

  describe("getDependenciesFromReportFile", () => {
    it("should throw an error if the file does not exist", () => {
      expect(() => getDependenciesFromReportFile("")).toThrow();
    });

    it("should return an array of GradleDependency objects if the file exists", () => {
      const dependencies = getDependenciesFromReportFile(
        "tests/fixtures/licenses_applicationinsights-java.json"
      );

      expect(dependencies).toBeDefined();
      expect(dependencies.length).toBeGreaterThan(0);

      expect(dependencies[0].moduleLicense).toBeDefined();
      expect(dependencies[0].moduleLicenseUrl).toBeDefined();
      expect(dependencies[0].moduleName).toBeDefined();
      expect(dependencies[0].moduleVersion).toBeDefined();
    });
  });

  describe("getReportFromString", () => {
    it("should return a GradleDependencyReport object from a string of file content", () => {
      const reportFileContent =
        '{"dependencies":[{"moduleName":"applicationinsights-core","moduleVersion":"2.6.1","moduleLicense":"MIT","moduleLicenseUrl":"http://www.opensource.org/licenses/mit-license.php"}]}';
      const report = getReportFromString(reportFileContent);

      expect(report).toBeDefined();
      expect(report.dependencies).toBeDefined();
      expect(report.dependencies.length).toBeGreaterThan(0);

      expect(report.dependencies[0].moduleLicense).toBeDefined();
      expect(report.dependencies[0].moduleLicenseUrl).toBeDefined();
      expect(report.dependencies[0].moduleName).toBeDefined();
      expect(report.dependencies[0].moduleVersion).toBeDefined();
    });
  });
});
