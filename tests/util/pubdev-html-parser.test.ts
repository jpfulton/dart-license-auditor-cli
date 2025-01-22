import { readFileSync } from "fs";
import { join } from "path";
import {
  PubDevMetadata,
  PubDevParseError,
  convertToDependency,
  parsePackageHtml,
} from "../../src/util/pubdev-html-parser";
import { ParsedDependency } from "../../src/util/yaml-parser";

describe("pubdev-html-parser", () => {
  let fixtureHtml: string;

  beforeAll(() => {
    fixtureHtml = readFileSync(
      join(__dirname, "../fixtures/pubdev_http-1.2.2_Dart_package.html"),
      "utf8"
    );
  });

  describe("parsePackageHtml", () => {
    it("should parse license information correctly", () => {
      const metadata = parsePackageHtml(fixtureHtml);
      expect(metadata.license.type).toBe("BSD-3-Clause");
      expect(metadata.license.url).toBe(
        "https://pub.dev/packages/http/versions/1.2.2/license"
      );
    });

    it("should parse publisher information correctly", () => {
      const metadata = parsePackageHtml(fixtureHtml);
      expect(metadata.publisher).toBe("dart.dev");
    });

    it("should parse repository URL correctly", () => {
      const metadata = parsePackageHtml(fixtureHtml);
      expect(metadata.repository).toBe(
        "https://github.com/dart-lang/http/tree/master/pkgs/http"
      );
    });

    it("should handle missing publisher gracefully", () => {
      const modifiedHtml = fixtureHtml.replace(
        /<h3 class="title">Publisher<\/h3>[\s\S]*?<\/p>/,
        ""
      );
      const metadata = parsePackageHtml(modifiedHtml);
      expect(metadata.publisher).toBeUndefined();
    });

    it("should throw PubDevParseError when license information is missing", () => {
      const modifiedHtml = fixtureHtml.replace(
        /<h3 class="title">License<\/h3>[\s\S]*?<\/p>/,
        ""
      );
      expect(() => parsePackageHtml(modifiedHtml)).toThrow(PubDevParseError);
    });

    it("should throw PubDevParseError when metadata section is missing", () => {
      const modifiedHtml = fixtureHtml.replace(
        /<aside class="detail-info-box">[\s\S]*?<\/aside>/,
        ""
      );
      expect(() => parsePackageHtml(modifiedHtml)).toThrow(PubDevParseError);
    });

    // Test different repository URL scenarios
    describe("repository URL detection", () => {
      it("should find repository URL by explicit Repository link", () => {
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
        const metadata = parsePackageHtml(html);
        expect(metadata.repository).toBe("https://gitlab.com/my/repo");
      });

      it("should find repository URL by common hosting service patterns", () => {
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
        const metadata = parsePackageHtml(html);
        expect(metadata.repository).toBe("https://gitlab.com/my/repo");
      });

      it("should handle custom git hosting URLs", () => {
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
        const metadata = parsePackageHtml(html);
        expect(metadata.repository).toBe("https://git.example.com/my/repo");
      });
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
