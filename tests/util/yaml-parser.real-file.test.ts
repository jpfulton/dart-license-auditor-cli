import path from "path";
import { getAllDependencies, parseYamlFile } from "../../src/util/yaml-parser";

describe("yaml-parser with real fixture file", () => {
  const fixturePath = path.join("tests", "fixtures", "pubspec.yaml");

  describe("parseYamlFile", () => {
    it("correctly parses a real pubspec.yaml file", () => {
      const result = parseYamlFile(fixturePath);

      expect(result.name).toBe("th");
      expect(result.description).toBe("A new Flutter project.");
      expect(result.version).toBe("1.0.0+4");
      expect(result.dependencies).toBeDefined();
      expect(result.dev_dependencies).toBeDefined();
    });

    it("correctly parses dependencies with different formats", () => {
      const result = parseYamlFile(fixturePath);

      // Test SDK dependency
      expect(result.dependencies.flutter).toEqual({ sdk: "flutter" });

      // Test version string dependency
      expect(result.dependencies.cupertino_icons).toBe("^1.0.8");

      // Test git dependency
      expect(result.dependencies.webviewx).toEqual({
        git: {
          url: "https://github.com/Lockbox-AI/webviewx.git",
          ref: "main",
        },
      });
    });
  });

  describe("getAllDependencies", () => {
    it("processes all dependencies from real file", () => {
      const pubspec = parseYamlFile(fixturePath);
      const results = getAllDependencies(pubspec);

      // Test a few key dependencies we know should be there
      expect(results).toContainEqual({
        name: "flutter",
        version: null,
        source: "sdk",
      });

      expect(results).toContainEqual({
        name: "cupertino_icons",
        version: "^1.0.8",
        source: "pub",
      });

      expect(results).toContainEqual({
        name: "webviewx",
        version: "main",
        source: "git",
      });

      // Verify some counts
      const sdkDeps = results.filter((d) => d.source === "sdk");
      const pubDeps = results.filter((d) => d.source === "pub");
      const gitDeps = results.filter((d) => d.source === "git");

      expect(sdkDeps.length).toBeGreaterThan(0);
      expect(pubDeps.length).toBeGreaterThan(0);
      expect(gitDeps.length).toBeGreaterThan(0);
    });

    it("correctly processes all dependency types from real file", () => {
      const pubspec = parseYamlFile(fixturePath);
      const results = getAllDependencies(pubspec);

      // Sample each type of dependency we expect to find
      const sdkDep = results.find((d) => d.name === "flutter");
      const versionDep = results.find((d) => d.name === "cupertino_icons");
      const gitDep = results.find((d) => d.name === "webviewx");

      expect(sdkDep).toBeDefined();
      expect(versionDep).toBeDefined();
      expect(gitDep).toBeDefined();

      // Verify their structures
      expect(sdkDep?.source).toBe("sdk");
      expect(versionDep?.version).toMatch(/^\^/); // Should start with caret
      expect(gitDep?.source).toBe("git");
    });
  });
});
