import fs from "fs";
import path from "path";
import { fetchLicenseHtml } from "../../src/util/pub-dev-fetcher";
import {
  PubDevMetadata,
  PubDevParseError,
  convertToDependency,
  parsePackageHtml,
} from "../../src/util/pubdev-html-parser";
import { ParsedDependency } from "../../src/util/yaml-parser";

// Mock the fetchLicenseHtml function
jest.mock("../../src/util/pub-dev-fetcher");
const mockedFetchLicenseHtml = fetchLicenseHtml as jest.MockedFunction<
  typeof fetchLicenseHtml
>;

describe("pubdev-html-parser", () => {
  let fixtureHtml: string;
  let licensePageHtml: string;

  beforeAll(() => {
    fixtureHtml = fs.readFileSync(
      path.join(__dirname, "../fixtures/pubdev_http-1.2.2_Dart_package.html"),
      "utf8"
    );
    licensePageHtml = fs.readFileSync(
      path.join(
        __dirname,
        "../fixtures/pubdev_image-4.3.0_license_Dart_package.html"
      ),
      "utf-8"
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("parsePackageHtml", () => {
    it("should parse license information correctly", async () => {
      const metadata = await parsePackageHtml(fixtureHtml, "http", "1.2.2");
      expect(metadata.license.type).toBe("BSD-3-Clause");
      expect(metadata.license.url).toBe(
        "https://pub.dev/packages/http/versions/1.2.2/license"
      );
    });

    it("should parse publisher information correctly", async () => {
      const metadata = await parsePackageHtml(fixtureHtml, "http", "1.2.2");
      expect(metadata.publisher).toBe("dart.dev");
    });

    it("should parse repository URL correctly", async () => {
      const metadata = await parsePackageHtml(fixtureHtml, "http", "1.2.2");
      expect(metadata.repository).toBe(
        "https://github.com/dart-lang/http/tree/master/pkgs/http"
      );
    });

    it("should handle missing publisher gracefully", async () => {
      const modifiedHtml = fixtureHtml.replace(
        /<h3 class="title">Publisher<\/h3>[\s\S]*?<\/p>/,
        ""
      );
      const metadata = await parsePackageHtml(modifiedHtml, "http", "1.2.2");
      expect(metadata.publisher).toBeUndefined();
    });

    it("should throw PubDevParseError when license information is missing", async () => {
      const modifiedHtml = fixtureHtml.replace(
        /<h3 class="title">License<\/h3>[\s\S]*?<\/p>/,
        ""
      );
      await expect(
        parsePackageHtml(modifiedHtml, "http", "1.2.2")
      ).rejects.toThrow(PubDevParseError);
    });

    it("should throw PubDevParseError when metadata section is missing", async () => {
      const modifiedHtml = fixtureHtml.replace(
        /<aside class="detail-info-box">[\s\S]*?<\/aside>/,
        ""
      );
      await expect(
        parsePackageHtml(modifiedHtml, "http", "1.2.2")
      ).rejects.toThrow(PubDevParseError);
    });

    // Test different repository URL scenarios
    describe("repository URL detection", () => {
      it("should find repository URL by explicit Repository link", async () => {
        const html = `
          <div class="detail-wrapper -active -has-info-box">
            <div class="detail-body">
              <aside class="detail-info-box">
                <h3 class="title">License</h3>
                <p>MIT (license)</p>
                <p><a class="link" href="https://gitlab.com/my/repo">Repository (GitLab)</a></p>
              </aside>
            </div>
          </div>
        `;
        const metadata = await parsePackageHtml(html, "test", "1.0.0");
        expect(metadata.repository).toBe("https://gitlab.com/my/repo");
      });

      it("should find repository URL by common hosting service patterns", async () => {
        const html = `
          <div class="detail-wrapper -active -has-info-box">
            <div class="detail-body">
              <aside class="detail-info-box">
                <h3 class="title">License</h3>
                <p>MIT (license)</p>
                <p><a class="link" href="https://gitlab.com/my/repo">Source Code</a></p>
              </aside>
            </div>
          </div>
        `;
        const metadata = await parsePackageHtml(html, "test", "1.0.0");
        expect(metadata.repository).toBe("https://gitlab.com/my/repo");
      });

      it("should handle custom git hosting URLs", async () => {
        const html = `
          <div class="detail-wrapper -active -has-info-box">
            <div class="detail-body">
              <aside class="detail-info-box">
                <h3 class="title">License</h3>
                <p>MIT (license)</p>
                <p><a class="link" href="https://git.example.com/my/repo">Source Code</a></p>
              </aside>
            </div>
          </div>
        `;
        const metadata = await parsePackageHtml(html, "test", "1.0.0");
        expect(metadata.repository).toBe("https://git.example.com/my/repo");
      });
    });

    it("should handle unknown license by fetching license text", async () => {
      const packageHtml = `
        <html>
          <body>
            <aside class="detail-info-box">
              <h3 class="title">License</h3>
              <p>unknown (<a href="/packages/test_package/license">license</a>)</p>
            </aside>
          </body>
        </html>
      `;

      mockedFetchLicenseHtml.mockResolvedValueOnce(licensePageHtml);

      const metadata = await parsePackageHtml(
        packageHtml,
        "test_package",
        "1.0.0"
      );
      expect(metadata.license.type).toBe("The MIT License");
      expect(mockedFetchLicenseHtml).toHaveBeenCalledWith(
        "test_package",
        "1.0.0"
      );
    });

    it("should keep unknown license if license page fetch fails", async () => {
      const packageHtml = `
        <html>
          <body>
            <aside class="detail-info-box">
              <h3 class="title">License</h3>
              <p>unknown (<a href="/packages/test_package/license">license</a>)</p>
            </aside>
          </body>
        </html>
      `;

      mockedFetchLicenseHtml.mockRejectedValueOnce(
        new Error("Failed to fetch")
      );

      const metadata = await parsePackageHtml(
        packageHtml,
        "test_package",
        "1.0.0"
      );
      expect(metadata.license.type).toBe("unknown");
      expect(mockedFetchLicenseHtml).toHaveBeenCalledWith(
        "test_package",
        "1.0.0"
      );
    });

    it("should not fetch license page for known license types", async () => {
      const packageHtml = `
        <html>
          <body>
            <aside class="detail-info-box">
              <h3 class="title">License</h3>
              <p>MIT (<a href="/packages/test_package/license">license</a>)</p>
            </aside>
          </body>
        </html>
      `;

      const metadata = await parsePackageHtml(
        packageHtml,
        "test_package",
        "1.0.0"
      );
      expect(metadata.license.type).toBe("MIT");
      expect(mockedFetchLicenseHtml).not.toHaveBeenCalled();
    });

    it("should throw error when license section is missing", async () => {
      const packageHtml = `
        <html>
          <body>
            <aside class="detail-info-box">
              <h3 class="title">Other</h3>
            </aside>
          </body>
        </html>
      `;

      await expect(
        parsePackageHtml(packageHtml, "test_package", "1.0.0")
      ).rejects.toThrow("Could not find license information");
    });

    it("should throw error when info box is missing", async () => {
      const packageHtml = `
        <html>
          <body>
          </body>
        </html>
      `;

      await expect(
        parsePackageHtml(packageHtml, "test_package", "1.0.0")
      ).rejects.toThrow("Could not find package metadata section");
    });
  });

  describe("convertToDependency", () => {
    const sampleMetadata: PubDevMetadata = {
      license: {
        type: "MIT",
        url: "https://pub.dev/packages/sample/license",
      },
      publisher: "test.dev",
      repository: "https://github.com/test/sample",
    };

    const sampleParsedDep: ParsedDependency = {
      name: "sample",
      version: "1.0.0",
      source: "pub",
    };

    it("should convert metadata and parsed dependency to Dependency object", () => {
      const dependency = convertToDependency(
        sampleParsedDep,
        sampleMetadata,
        "root-project"
      );

      expect(dependency).toEqual({
        rootProjectName: "root-project",
        name: "sample",
        version: "1.0.0",
        licenses: [
          {
            license: "MIT",
            url: "https://pub.dev/packages/sample/license",
          },
        ],
        publisher: "test.dev",
        repository: "https://github.com/test/sample",
      });
    });

    it("should handle missing optional fields", () => {
      const minimalMetadata: PubDevMetadata = {
        license: {
          type: "MIT",
          url: "https://pub.dev/packages/sample/license",
        },
      };

      const dependency = convertToDependency(
        sampleParsedDep,
        minimalMetadata,
        "root-project"
      );

      expect(dependency.publisher).toBe("");
      expect(dependency.repository).toBe("");
    });

    it("should handle missing version in parsed dependency", () => {
      const depWithoutVersion: ParsedDependency = {
        name: "sample",
        version: null,
        source: "pub",
      };

      const dependency = convertToDependency(
        depWithoutVersion,
        sampleMetadata,
        "root-project"
      );

      expect(dependency.version).toBe("");
    });
  });
});
