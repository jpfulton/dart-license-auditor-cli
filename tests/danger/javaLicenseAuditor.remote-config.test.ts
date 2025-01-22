/* eslint-disable @typescript-eslint/no-var-requires */
import { Dependency } from "@jpfulton/license-auditor-common";
import { IPluginConfig } from "../../src/danger/danger-plugin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;
declare let javaLicenseAuditor:
  | ((config: Partial<IPluginConfig>) => Promise<void>)
  | undefined;

const validConfigurationUrl =
  "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/.license-checker.json";
const invalidConfigurationUrl =
  "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/non-existent-file.json";

// tests for javaLicenseAuditor DangerJS plugin module with remote configuration
describe("javaLicenseAuditor DangerJS plugin module with remote configuration", () => {
  beforeEach(() => {
    // mock the danger functions warn, fail, and markdown and attach them to the global object
    global.warn = jest.fn();
    global.fail = jest.fn();
    global.markdown = jest.fn();

    jest.doMock("../../src/util", () => {
      // mock isMavenProject to return true
      return {
        ...jest.requireActual("../../src/util"),
        getRootProjectName: () => "test",
        isMavenProject: () => true,
      };
    });

    jest.doMock("../../src/auditor/licenseChecker", () => {
      // mock findAllLicenses to return an array of licenses
      const licenses: Dependency[] = [
        {
          licenses: [
            {
              license: "test",
              url: "test",
            },
          ],
          name: "test",
          version: "test",
          repository: "test",
          publisher: "test",
          rootProjectName: "test",
          email: "test",
          path: "test",
        },
      ];
      return {
        findAllDependencies: () => licenses,
      };
    });

    // mock the parseLicense function with a function that returns
    // values that include a blacklisted license so that it will be used
    // within the javaLicenseAuditor function called within the tests
    jest.doMock("../../src/auditor/parseLicenses", () => {
      return {
        parserFactory: () => {
          return () => {
            return {
              uniqueCount: 3,
              whitelistedCount: 1,
              warnCount: 1,
              blacklistedCount: 1,
              outputs: ["test"],
            };
          };
        },
      };
    });
  });

  afterEach(() => {
    // set the global object back to its original state
    global.warn = undefined;
    global.fail = undefined;
    global.markdown = undefined;

    // reset the mocks
    jest.unmock("../../src/auditor/licenseChecker");
    jest.unmock("../../src/auditor/parseLicenses");
    jest.unmock("../../src/util");

    // reset the javaLicenseAuditor function
    javaLicenseAuditor = undefined;

    // reset modules
    jest.resetModules();
  });

  it("should succeed using a valid remote configuration", async () => {
    // arrange
    javaLicenseAuditor =
      require("../../src/danger/danger-plugin").javaLicenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
      remoteConfigurationUrl: validConfigurationUrl,
    };

    // act
    await javaLicenseAuditor!(config);

    // assert
    expect(global.fail).not.toHaveBeenCalled();
  });

  it("should fail using an invalid remote configuration", async () => {
    // arrange
    javaLicenseAuditor =
      require("../../src/danger/danger-plugin").javaLicenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
      remoteConfigurationUrl: invalidConfigurationUrl,
    };
    const message = `[java-license-auditor-cli] Failed to audit licenses with error: Unable to load configuration from URL: ${invalidConfigurationUrl} Status: 404 was returned.`;

    // act
    await javaLicenseAuditor!(config);

    // assert
    expect(global.fail).toHaveBeenCalledWith(message);
  });
});
