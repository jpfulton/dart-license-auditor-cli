import { readFileSync } from "fs";
import {
  getAllDependencies,
  parseDependency,
  parseYamlFile,
  PubspecYaml,
} from "../../src/util/yaml-parser";

// Mock fs module
jest.mock("fs");
const mockedReadFileSync = readFileSync as jest.MockedFunction<
  typeof readFileSync
>;

describe("yaml-parser", () => {
  describe("parseDependency", () => {
    it("parses pub.dev dependency with version", () => {
      const result = parseDependency("cupertino_icons", "^1.0.8");
      expect(result).toEqual({
        name: "cupertino_icons",
        version: "^1.0.8",
        source: "pub",
      });
    });

    it("parses sdk dependency", () => {
      const result = parseDependency("flutter", { sdk: "flutter" });
      expect(result).toEqual({
        name: "flutter",
        version: null,
        source: "sdk",
      });
    });

    it("parses git dependency with ref", () => {
      const result = parseDependency("webviewx", {
        git: {
          url: "https://github.com/Lockbox-AI/webviewx.git",
          ref: "main",
        },
      });
      expect(result).toEqual({
        name: "webviewx",
        version: "main",
        source: "git",
      });
    });

    it("parses git dependency without ref", () => {
      const result = parseDependency("webviewx", {
        git: {
          url: "https://github.com/Lockbox-AI/webviewx.git",
        },
      });
      expect(result).toEqual({
        name: "webviewx",
        version: null,
        source: "git",
      });
    });

    it("parses path dependency", () => {
      const result = parseDependency("my_local_package", {
        path: "../my_local_package",
      });
      expect(result).toEqual({
        name: "my_local_package",
        version: null,
        source: "path",
      });
    });

    it("throws error for unknown dependency format", () => {
      expect(() => {
        // @ts-expect-error testing invalid input
        parseDependency("invalid", { invalid: "format" });
      }).toThrow("Unknown dependency format for invalid");
    });
  });

  describe("getAllDependencies", () => {
    const mockPubspec: PubspecYaml = {
      name: "test_app",
      description: "Test application",
      version: "1.0.0",
      dependencies: {
        flutter: { sdk: "flutter" },
        cupertino_icons: "^1.0.8",
        webviewx: {
          git: {
            url: "https://github.com/Lockbox-AI/webviewx.git",
            ref: "main",
          },
        },
      },
      dev_dependencies: {
        flutter_test: { sdk: "flutter" },
        test_dep: "^2.0.0",
      },
    };

    it("processes both regular and dev dependencies", () => {
      const results = getAllDependencies(mockPubspec);
      expect(results).toHaveLength(5);
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
      expect(results).toContainEqual({
        name: "flutter_test",
        version: null,
        source: "sdk",
      });
      expect(results).toContainEqual({
        name: "test_dep",
        version: "^2.0.0",
        source: "pub",
      });
    });

    it("handles missing dev_dependencies", () => {
      const pubspecWithoutDev: PubspecYaml = {
        ...mockPubspec,
        dev_dependencies: undefined,
      };
      const results = getAllDependencies(pubspecWithoutDev);
      expect(results).toHaveLength(3);
    });
  });

  describe("parseYamlFile", () => {
    beforeEach(() => {
      mockedReadFileSync.mockReset();
    });

    it("correctly parses a pubspec.yaml file", () => {
      const mockYamlContent = `
name: test_app
description: Test application
version: 1.0.0
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
`;
      mockedReadFileSync.mockReturnValue(mockYamlContent);

      const result = parseYamlFile("pubspec.yaml");
      expect(result).toEqual({
        name: "test_app",
        description: "Test application",
        version: "1.0.0",
        dependencies: {
          flutter: { sdk: "flutter" },
          cupertino_icons: "^1.0.8",
        },
      });
      expect(mockedReadFileSync).toHaveBeenCalledWith("pubspec.yaml", "utf8");
    });
  });
});
