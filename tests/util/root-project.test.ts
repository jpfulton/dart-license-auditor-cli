import * as fs from "fs";
import path from "path";
import * as yaml from "yaml";
import { getRootProjectName } from "../../src/util/root-project";

// Mock the fs and process modules
jest.mock("fs");
const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedCwd = jest.spyOn(process, "cwd");

describe("root-project", () => {
  describe("getRootProjectName", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Set a default mock for process.cwd()
      mockedCwd.mockReturnValue("/fake/current/directory");
    });

    it("should return package name from pubspec.yaml when it exists", () => {
      const mockPubspec = {
        name: "test_project",
        description: "A test project",
        version: "1.0.0",
      };

      mockedFs.readFileSync.mockReturnValue(yaml.stringify(mockPubspec));

      const result = getRootProjectName();
      expect(result).toBe("test_project");
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), "pubspec.yaml"),
        expect.any(String)
      );
    });

    it("should use provided path when specified", () => {
      const mockPubspec = {
        name: "mono_repo_project",
        description: "A project in a monorepo",
        version: "1.0.0",
      };

      mockedFs.readFileSync.mockReturnValue(yaml.stringify(mockPubspec));

      const customPath = "/custom/project/path";
      const result = getRootProjectName(customPath);

      expect(result).toBe("mono_repo_project");
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        path.join(customPath, "pubspec.yaml"),
        expect.any(String)
      );
    });

    it("should fallback to directory name when pubspec.yaml doesn't exist", () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error("File not found");
      });

      const result = getRootProjectName();
      expect(result).toBe("directory"); // basename of /fake/current/directory
    });

    it("should fallback to directory name when pubspec.yaml is invalid", () => {
      mockedFs.readFileSync.mockReturnValue("invalid: yaml: content:");

      const result = getRootProjectName();
      expect(result).toBe("directory");
    });

    it("should use basename of custom path when pubspec.yaml doesn't exist in specified path", () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error("File not found");
      });

      const customPath = "/custom/project/my-dart-app";
      const result = getRootProjectName(customPath);

      expect(result).toBe("my-dart-app");
    });
  });
});
