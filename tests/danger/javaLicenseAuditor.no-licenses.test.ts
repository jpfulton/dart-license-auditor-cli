/* eslint-disable @typescript-eslint/no-var-requires */
import { IPluginConfig } from "../../src/danger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;
declare let javaLicenseAuditor:
  | ((config: Partial<IPluginConfig>) => Promise<void>)
  | undefined;

describe("javaLicenseAuditor when there are no licenses", () => {
  beforeAll(() => {
    // mock the danger functions warn, fail, and markdown and attach them to the global object
    global.warn = jest.fn();
    global.fail = jest.fn();
    global.markdown = jest.fn();

    // mock the findAllLicenses function to return an empty array
    // based on an import from the auditor module
    jest.doMock("../../src/auditor", () => {
      return {
        findAllDependencies: jest.fn().mockImplementation(() => {
          return [];
        }),
      };
    });
  });

  afterAll(() => {
    // set the global object back to its original state
    global.warn = undefined;
    global.fail = undefined;
    global.markdown = undefined;

    // un-mock the findAllLicenses function
    jest.unmock("../../src/auditor");

    // reset the javaLicenseAuditor function
    javaLicenseAuditor = undefined;

    // reset modules
    jest.resetModules();
  });

  it("should call warn if there are no licenses", async () => {
    // arrange
    javaLicenseAuditor =
      require("../../src/danger/danger-plugin").javaLicenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
    };
    const message = `No dependencies found.`;

    // act
    await javaLicenseAuditor!(config);

    // assert
    expect(global.warn).toBeCalledWith(message);
  });
});
