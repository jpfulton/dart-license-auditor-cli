import { Dependency } from "@jpfulton/license-auditor-common";
import { MavenDependency } from "../../src/models";
import {
  convertGradleDependency,
  convertMavenDependency,
} from "../../src/util/converters.js";

describe("convertMavenDependencyToLicense", () => {
  it("should convert a MavenDependency to a License", () => {
    const dependency: MavenDependency = {
      groupId: "com.example",
      artifactId: "example",
      version: "1.0.0",
      url: "https://example.com",
      scope: "compile",
      type: "jar",
      licenses: [
        {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      ],
    };

    const license: Dependency = convertMavenDependency(
      dependency,
      "com.example:root-project"
    );

    expect(license).toEqual({
      name: "com.example:example",
      version: "1.0.0",
      licenses: [
        {
          license: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      ],
      repository: "https://example.com",
      publisher: "com.example",
      rootProjectName: "com.example:root-project",
    });
  });

  it("should convert a MavenDependency to a License with multiple licenses", () => {
    const dependency: MavenDependency = {
      groupId: "com.example",
      artifactId: "example",
      version: "1.0.0",
      url: "https://example.com",
      scope: "compile",
      type: "jar",
      licenses: [
        {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
        {
          name: "Apache-2.0",
          url: "https://opensource.org/licenses/Apache-2.0",
        },
      ],
    };

    const rootProjectName = "com.example:root-project";
    const license: Dependency = convertMavenDependency(
      dependency,
      rootProjectName
    );

    expect(license).toEqual({
      name: "com.example:example",
      version: "1.0.0",
      licenses: [
        {
          license: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
        {
          license: "Apache-2.0",
          url: "https://opensource.org/licenses/Apache-2.0",
        },
      ],
      repository: "https://example.com",
      publisher: "com.example",
      rootProjectName: "com.example:root-project",
    });
  });
});

describe("convertGradleDependencyToLicense", () => {
  it("should convert a GradleDependency to a License", () => {
    const dependency = {
      moduleName: "com.example:example",
      moduleVersion: "1.0.0",
      moduleLicense: "MIT",
      moduleLicenseUrl: "https://opensource.org/licenses/MIT",
      moduleUrl: "https://example.com",
    };

    const license: Dependency = convertGradleDependency(
      dependency,
      "com.example:root-project"
    );

    expect(license).toEqual({
      name: "com.example:example",
      version: "1.0.0",
      licenses: [
        {
          license: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      ],
      publisher: "https://example.com",
      repository: "https://example.com",
      rootProjectName: "com.example:root-project",
    });
  });
});
