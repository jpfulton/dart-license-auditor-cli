import fs from "fs";
import path from "path";
import { parseLicenseHtml } from "../../src/util/pubdev-html-parser";

describe("pubdev-license-parser", () => {
  let licensePageHtml: string;

  beforeAll(() => {
    licensePageHtml = fs.readFileSync(
      path.join(
        __dirname,
        "../fixtures/pubdev_image-4.3.0_license_Dart_package.html"
      ),
      "utf-8"
    );
  });

  describe("parseLicenseHtml", () => {
    it("should extract the first line of the license text from a real pub.dev license page", () => {
      const licenseType = parseLicenseHtml(licensePageHtml);
      expect(licenseType).toBe("The MIT License");
    });

    it("should handle HTML without the license section", () => {
      const html = `
        <html>
          <body>
            <main class="container">
              <div class="detail-body">
                <div class="detail-tabs-content">
                  <section class="tab-content">
                    <div class="highlight">
                      <pre>Some other content</pre>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          </body>
        </html>
      `;
      expect(() => parseLicenseHtml(html)).toThrow(
        "Could not find license text"
      );
    });

    it("should handle HTML with empty license text", () => {
      const html = `
        <html>
          <body>
            <main class="container">
              <div class="detail-body">
                <div class="detail-tabs-content">
                  <section class="tab-content detail-tab-license-content">
                    <div class="highlight">
                      <pre></pre>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          </body>
        </html>
      `;
      expect(() => parseLicenseHtml(html)).toThrow(
        "Could not find license text"
      );
    });

    it("should handle malformed HTML", () => {
      const html = "not html";
      expect(() => parseLicenseHtml(html)).toThrow(
        "Could not find license text"
      );
    });

    it("should handle HTML with multiple pre tags but select the correct one", () => {
      const html = `
        <html>
          <body>
            <pre>Wrong license text</pre>
            <main class="container">
              <div class="detail-body">
                <div class="detail-tabs-content">
                  <section class="tab-content detail-tab-license-content">
                    <div class="highlight">
                      <pre>The MIT License</pre>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          </body>
        </html>
      `;
      const licenseType = parseLicenseHtml(html);
      expect(licenseType).toBe("The MIT License");
    });
  });
});
