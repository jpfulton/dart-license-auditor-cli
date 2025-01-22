import { auditToCsv } from "../../src/commands";

// auditToCsv is a command that outputs a CSV file of the licenses of the packages in a project
describe("auditToCsv", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should output the CSV headers if the --headers option is specified", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await auditToCsv(".", {
      headers: true,
      data: false,
      remote: "",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      `Project Name,Audit Status,Package Name,Package Version,Package License,Package Publisher,Package Publisher Email,Package Repository,Package Module Path,Package License Path`
    );
  });

  it("should not output the CSV headers if the --headers option is not specified", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await auditToCsv(".", {
      headers: false,
      data: false,
      remote: "",
    });

    expect(consoleSpy).not.toHaveBeenCalledWith(
      `Project Name,Audit Status,Package Name,Package Version,Package License,Package Publisher,Package Publisher Email,Package Repository,Package Module Path,Package License Path`
    );
  });

  it("should succeed if the URL does exist", async () => {
    await expect(
      auditToCsv(".", {
        headers: false,
        data: false,
        remote:
          "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/.license-checker.json",
      })
    ).resolves.not.toThrow();
  });

  it("should throw an error if the URL does not exist", async () => {
    await expect(
      auditToCsv(".", {
        headers: false,
        data: false,
        remote:
          "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/non-existent-file.json",
      })
    ).rejects.toThrow(
      `Unable to load configuration from URL: https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/non-existent-file.json Status: 404 was returned.`
    );
  });
});
