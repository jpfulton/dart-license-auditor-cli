import { existsSync } from "fs";
import { findAllDependencies } from "../../src/auditor/licenseChecker";
import {
  getMavenDependenciesFromRootNode,
  getReportRootNode,
} from "../../src/auditor/mavenParser";
import { isGradleProject, isMavenProject } from "../../src/util";
import { convertMavenDependencies } from "../../src/util/converters";

// Mock the dependencies
jest.mock("fs");
jest.mock("../../src/util");
jest.mock("../../src/util/converters");
jest.mock("../../src/auditor/mavenParser");

describe("findAllDependencies", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
    (existsSync as jest.Mock).mockReset();
    (isMavenProject as jest.Mock).mockReset();
    (isGradleProject as jest.Mock).mockReset();
    (getReportRootNode as jest.Mock).mockReset();
    (getMavenDependenciesFromRootNode as jest.Mock).mockReset();
    (convertMavenDependencies as jest.Mock).mockReset();
  });

  describe("Maven project path handling", () => {
    beforeEach(() => {
      // Setup for Maven project
      (isMavenProject as jest.Mock).mockReturnValue(true);
      (isGradleProject as jest.Mock).mockReturnValue(false);

      // Mock the Maven parser and converter functions
      (getReportRootNode as jest.Mock).mockReturnValue({});
      (getMavenDependenciesFromRootNode as jest.Mock).mockReturnValue([]);
      (convertMavenDependencies as jest.Mock).mockReturnValue([]);
    });

    it("should use modern Maven report path when it exists", () => {
      // Mock modern path exists, legacy doesn't
      (existsSync as jest.Mock).mockImplementation((path: string) =>
        path.includes("/target/reports/")
      );

      // Act & Assert
      expect(() => findAllDependencies("/test/project")).not.toThrow();
      expect(existsSync).toHaveBeenCalledWith(
        "/test/project/target/reports/dependencies.html"
      );
      expect(getReportRootNode).toHaveBeenCalledWith(
        "/test/project/target/reports/dependencies.html"
      );
    });

    it("should fall back to legacy Maven report path when modern doesn't exist", () => {
      // Mock only legacy path exists
      (existsSync as jest.Mock).mockImplementation((path: string) =>
        path.includes("/target/site/")
      );

      // Act & Assert
      expect(() => findAllDependencies("/test/project")).not.toThrow();
      expect(existsSync).toHaveBeenCalledWith(
        "/test/project/target/reports/dependencies.html"
      );
      expect(existsSync).toHaveBeenCalledWith(
        "/test/project/target/site/dependencies.html"
      );
      expect(getReportRootNode).toHaveBeenCalledWith(
        "/test/project/target/site/dependencies.html"
      );
    });

    it("should throw error when neither Maven report path exists", () => {
      // Mock no paths exist
      (existsSync as jest.Mock).mockReturnValue(false);

      // Act & Assert
      expect(() => findAllDependencies("/test/project")).toThrow(
        "No Maven dependencies report found at either modern (/target/reports/) or legacy (/target/site/) paths."
      );
      expect(existsSync).toHaveBeenCalledWith(
        "/test/project/target/reports/dependencies.html"
      );
      expect(existsSync).toHaveBeenCalledWith(
        "/test/project/target/site/dependencies.html"
      );
    });
  });
});
