import { existsSync, readFileSync } from "fs";

// return the version string from this module's package.json
export function getCurrentVersionString() {
  try {
    const packageJson = JSON.parse(
      readFileSync(`${__dirname}/../../../package.json`).toString()
    );
    const version = packageJson?.version ?? "UNKNOWN";
    return version;
  } catch (e) {
    // this error happens when running the tests
    // which have a different path relationship to the package.json file
    return "UNKNOWN";
  }
}

// return true if the root project is a maven project
// this can be determined by the existence of a pom.xml file
// in the root directory
export const isMavenProject = (pathToProject: string) => {
  if (existsSync(`${pathToProject}/pom.xml`)) {
    return true;
  } else {
    return false;
  }
};

// return true if the root project is a gradle project
// this can be determined by the existence of a build.gradle or build.gradle.kts file
// in the root directory
export const isGradleProject = (pathToProject: string) => {
  if (
    existsSync(`${pathToProject}/build.gradle`) ||
    existsSync(`${pathToProject}/build.gradle.kts`)
  ) {
    return true;
  } else {
    return false;
  }
};

// return the name of the root project
export const getRootProjectName = (pathToProject: string) => {
  if (isMavenProject(pathToProject)) {
    return getMavenProjectNameFromPomXml(`${pathToProject}/pom.xml`);
  } else if (isGradleProject(pathToProject)) {
    return getGradleProjectName(pathToProject);
  } else {
    throw new Error(
      "Could not determine root project name. Only maven and gradle projects are supported."
    );
  }
};

// return the name of a project from a pom.xml file
// specified by filename
export const getMavenProjectNameFromPomXml = (filename: string) => {
  const pomXml = getFileContents(filename);
  const artifactId = pomXml.match(/<artifactId>(.*)<\/artifactId>/)?.[1] ?? "";
  const groupId = pomXml.match(/<groupId>(.*)<\/groupId>/)?.[1] ?? "";
  const name = `${groupId}:${artifactId}`;
  return name;
};

// return the contents of a file specified by filename as a string
export const getFileContents = (filename: string) => {
  return readFileSync(filename).toString();
};

// pull the project name for a gradle project
// this can be found in either the settings.gradle or settings.gradle.kts file
export const getGradleProjectName = (pathToProject: string) => {
  const settingsGradle = `${pathToProject}/settings.gradle`;
  const settingsGradleKts = `${pathToProject}/settings.gradle.kts`;

  if (existsSync(settingsGradle)) {
    return getGradleProjectNameFromSettingsFile(settingsGradle);
  } else if (existsSync(settingsGradleKts)) {
    return getGradleProjectNameFromSettingsFile(settingsGradleKts);
  } else {
    throw new Error(
      "Could not determine root project name for Gradle project. settings.gradle or settings.gradle.kts must be present."
    );
  }
};

export const getGradleProjectNameFromSettingsFile = (filename: string) => {
  const settingsGradleKts = getFileContents(filename);
  const name = getGradleProjectNameFromString(settingsGradleKts);
  return name;
};

// return the name of the root project using a regex from a string
// of file contents, the file contents will include a line like:
// rootProject.name = 'snowflake-jdbc' or rootProject.name = "snowflake-jdbc"
export const getGradleProjectNameFromString = (fileContents: string) => {
  const name =
    fileContents.match(/rootProject.name\s*=\s*['"](.*)['"]/)?.[1] ?? "";

  if (name === "") {
    throw new Error(
      "Could not determine root project name for Gradle project. rootProject.name must be present in settings.gradle or settings.gradle.kts."
    );
  }

  return name;
};
