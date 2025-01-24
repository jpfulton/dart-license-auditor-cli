import fetch, { Response } from "node-fetch";
import {
  fetchLicenseHtml,
  fetchPackageHtml,
  fetchPackageHtmlFromDependency,
} from "../../src/util/pub-dev-fetcher";
import { ParsedDependency } from "../../src/util/yaml-parser";

// Mock node-fetch
jest.mock("node-fetch");
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("pub-dev-fetcher", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("fetchPackageHtml", () => {
    it("should fetch HTML for a valid package version", async () => {
      const mockHtml = "<html><body>Package content</body></html>";
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml),
        status: 200,
        statusText: "OK",
      } as Response);

      const html = await fetchPackageHtml("test_package", "1.0.0");

      // Verify the correct URL was called
      expect(mockedFetch).toHaveBeenCalledWith(
        "https://pub.dev/packages/test_package/versions/1.0.0"
      );
      expect(html).toBe(mockHtml);
    });

    it("should handle 404 responses", async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      await expect(fetchPackageHtml("nonexistent", "1.0.0")).rejects.toThrow(
        "Failed to fetch package info. Status: 404"
      );
    });

    it("should handle network errors", async () => {
      mockedFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(fetchPackageHtml("test_package", "1.0.0")).rejects.toThrow(
        "Error fetching package info: Network error"
      );
    });

    it("should handle rate limiting responses", async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      } as Response);

      await expect(fetchPackageHtml("test_package", "1.0.0")).rejects.toThrow(
        "Failed to fetch package info. Status: 429"
      );
    });
  });

  describe("fetchPackageHtmlFromDependency", () => {
    it("should fetch HTML using dependency information", async () => {
      const mockHtml = "<html><body>Package content</body></html>";
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml),
        status: 200,
        statusText: "OK",
      } as Response);

      const dependency: ParsedDependency = {
        name: "test_package",
        version: "1.0.0",
        source: "pub",
      };

      const html = await fetchPackageHtmlFromDependency(dependency);

      expect(mockedFetch).toHaveBeenCalledWith(
        "https://pub.dev/packages/test_package/versions/1.0.0"
      );
      expect(html).toBe(mockHtml);
    });

    it("should throw error when version is missing", async () => {
      const dependency: ParsedDependency = {
        name: "test_package",
        version: null,
        source: "pub",
      };

      await expect(fetchPackageHtmlFromDependency(dependency)).rejects.toThrow(
        "Cannot fetch package info for test_package: no version specified"
      );
      expect(mockedFetch).not.toHaveBeenCalled();
    });

    it("should handle non-pub source dependencies", async () => {
      const dependency: ParsedDependency = {
        name: "test_package",
        version: "1.0.0",
        source: "git",
      };

      await expect(fetchPackageHtmlFromDependency(dependency)).rejects.toThrow(
        "Cannot fetch package info for test_package: only pub source dependencies can be fetched"
      );
      expect(mockedFetch).not.toHaveBeenCalled();
    });
  });

  describe("fetchLicenseHtml", () => {
    it("should fetch license HTML for a valid package version", async () => {
      const mockHtml = "<html><body>License content</body></html>";
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml),
        status: 200,
        statusText: "OK",
      } as Response);

      const html = await fetchLicenseHtml("test_package", "1.0.0");

      // Verify the correct URL was called
      expect(mockedFetch).toHaveBeenCalledWith(
        "https://pub.dev/packages/test_package/versions/1.0.0/license"
      );
      expect(html).toBe(mockHtml);
    });

    it("should handle 404 responses", async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      await expect(fetchLicenseHtml("nonexistent", "1.0.0")).rejects.toThrow(
        "Failed to fetch license info. Status: 404"
      );
    });

    it("should handle network errors", async () => {
      mockedFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(fetchLicenseHtml("test_package", "1.0.0")).rejects.toThrow(
        "Error fetching license info: Network error"
      );
    });
  });
});
