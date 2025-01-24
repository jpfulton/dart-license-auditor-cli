export interface MavenDependency {
  groupId: string;
  artifactId: string;
  url?: string;
  version: string;
  scope?: string;
  type?: string;
  licenses?: MavenLicense[];
}

export interface MavenLicense {
  name: string;
  url?: string;
}
