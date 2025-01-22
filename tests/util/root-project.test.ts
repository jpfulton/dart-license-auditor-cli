import {
  getGradleProjectNameFromSettingsFile,
  getGradleProjectNameFromString,
  getMavenProjectNameFromPomXml,
} from "../../src/util/root-project.js";

describe("getMavenRootProjectNameFromPomXml", () => {
  it("should return the name of a project from a pom.xml file specified by filename", () => {
    const filename = "tests/fixtures/pom_snowflakedb-jdbc.xml";
    const name = getMavenProjectNameFromPomXml(filename);
    expect(name).toBe("net.snowflake:snowflake-jdbc");
  });
});

describe("getGradleProjectNameFromSettingsFile", () => {
  it("should return the name of the root project from a settings.gradle file", () => {
    const filename = "tests/fixtures/settings.gradle.mock";
    const name = getGradleProjectNameFromSettingsFile(filename);
    expect(name).toBe("snowflake-jdbc");
  });
});

describe("getGradleProjectNameFromString", () => {
  it("should return the name of the root project using a regex from a string of file contents", () => {
    const fileContents = `rootProject.name = 'snowflake-jdbc'`;
    const name = getGradleProjectNameFromString(fileContents);
    expect(name).toBe("snowflake-jdbc");
  });

  it("should return the name of the root project using a regex from a string of file contents", () => {
    const fileContents = `rootProject.name = "snowflake-jdbc"`;
    const name = getGradleProjectNameFromString(fileContents);
    expect(name).toBe("snowflake-jdbc");
  });

  it("should handle spaces in the root project name", () => {
    const fileContents = `rootProject.name = 'snowflake jdbc'`;
    const name = getGradleProjectNameFromString(fileContents);
    expect(name).toBe("snowflake jdbc");
  });

  it("should handle multiple lines in the file contents", () => {
    const fileContents = `some stuff
    rootProject.name = 'snowflake-jdbc'
    some other stuff`;
    const name = getGradleProjectNameFromString(fileContents);
    expect(name).toBe("snowflake-jdbc");
  });

  it("should handle multiple lines and address a case where two rootProject.name lines exist", () => {
    const fileContents = `some stuff
    rootProject.name = 'snowflake-jdbc'
    some other stuff
    rootProject.name = 'snowflake-jdbc2'
    some other stuff`;
    const name = getGradleProjectNameFromString(fileContents);
    expect(name).toBe("snowflake-jdbc");
  });

  it("should throw an error if the project name cannot be found", () => {
    const fileContents = `rootProject.name = ''`;
    expect(() => getGradleProjectNameFromString(fileContents)).toThrow();
  });

  it("should throw an error if the project name cannot be found", () => {
    const fileContents = `rootProject.name = ""`;
    expect(() => getGradleProjectNameFromString(fileContents)).toThrow();
  });

  it("should throw an error if the project name cannot be found", () => {
    const fileContents = `rootProject.name =`;
    expect(() => getGradleProjectNameFromString(fileContents)).toThrow();
  });

  it("should throw an error if the project name cannot be found in a multiline file", () => {
    const fileContents = `some stuff
    some other stuff
    still more stuff`;
    expect(() => getGradleProjectNameFromString(fileContents)).toThrow();
  });
});
