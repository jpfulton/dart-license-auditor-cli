export interface GradleDependency {
  moduleName: string;
  moduleUrl?: string;
  moduleVersion: string;
  moduleLicense: string;
  moduleLicenseUrl: string;
}

export interface GradleDependencyReport {
  dependencies: GradleDependency[];
}
