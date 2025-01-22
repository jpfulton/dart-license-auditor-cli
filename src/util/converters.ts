import { Dependency } from "@jpfulton/license-auditor-common";
import { GradleDependency, MavenDependency, MavenLicense } from "../models";

export const convertMavenDependency = (
  mavenDependency: MavenDependency,
  rootProjectName: string
): Dependency => {
  const license: Dependency = {
    rootProjectName: rootProjectName,
    name: mavenDependency.groupId + ":" + mavenDependency.artifactId,
    version: mavenDependency.version,
    licenses:
      mavenDependency.licenses?.map((mavenLicense: MavenLicense) => {
        return {
          license: mavenLicense.name,
          url: mavenLicense.url,
        };
      }) || [],
    publisher: mavenDependency.groupId,
    repository: mavenDependency.url || "",
  };

  return license;
};

export const convertMavenDependencies = (
  mavenDependencies: MavenDependency[],
  rootProjectName: string
): Dependency[] => {
  return mavenDependencies.map((mavenDependency) => {
    return convertMavenDependency(mavenDependency, rootProjectName);
  });
};

export const convertGradleDependency = (
  gradleDependency: GradleDependency,
  rootProjectName: string
): Dependency => {
  const Dependency: Dependency = {
    rootProjectName: rootProjectName,
    name: gradleDependency.moduleName,
    version: gradleDependency.moduleVersion,
    licenses: [
      {
        license: gradleDependency.moduleLicense,
        url: gradleDependency.moduleLicenseUrl,
      },
    ],
    publisher: gradleDependency.moduleUrl || "",
    repository: gradleDependency.moduleUrl || "",
  };

  return Dependency;
};

export const convertGradleDependencies = (
  gradleDependencies: GradleDependency[],
  rootProjectName: string
): Dependency[] => {
  return gradleDependencies.map((gradleDependency) => {
    return convertGradleDependency(gradleDependency, rootProjectName);
  });
};
