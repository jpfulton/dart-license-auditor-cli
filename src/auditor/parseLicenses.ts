import {
  Configuration,
  Dependency,
  DependencyOutputter,
  mapLicenseByGroupings,
} from "@jpfulton/license-auditor-common";

export const parserFactory =
  (
    configuration: Configuration,
    infoOutputter: DependencyOutputter,
    warnOutputter: DependencyOutputter,
    errorOutputter: DependencyOutputter
  ) =>
  (
    dependencies: Dependency[]
  ): {
    uniqueCount: number;
    whitelistedCount: number;
    warnCount: number;
    blacklistedCount: number;
    allOutputs: string[];
    blackListOutputs: string[];
    warnOutputs: string[];
    whiteListOutputs: string[];
  } => {
    let whitelistedCount = 0;
    let warnCount = 0;
    let blacklistedCount = 0;

    const whitelistedLicenses = configuration.whiteList;
    const blacklistedLicenses = configuration.blackList;

    const allOutputs: string[] = [];
    const blackListOutputs: string[] = [];
    const warnOutputs: string[] = [];
    const whiteListOutputs: string[] = [];

    dependencies.forEach((dependency) => {
      const isWhitelisted = dependency.licenses.some((depLicense) =>
        whitelistedLicenses.includes(
          mapLicenseByGroupings(configuration, depLicense.license)
        )
      );

      if (isWhitelisted) {
        whitelistedCount++;
        const result = infoOutputter(dependency);
        if (result !== "") {
          allOutputs.push(result);
          whiteListOutputs.push(result);
        }
      }

      // a dependency is blacklisted if it has a license that is in the blacklist
      // and does not include a license that is in the whitelist
      const isBlacklisted =
        dependency.licenses.some((depLicense) =>
          blacklistedLicenses.includes(
            mapLicenseByGroupings(configuration, depLicense.license)
          )
        ) && !isWhitelisted;

      if (!isWhitelisted && !isBlacklisted) {
        warnCount++;
        const result = warnOutputter(dependency);
        if (result !== "") {
          allOutputs.push(result);
          warnOutputs.push(result);
        }
      }

      if (isBlacklisted) {
        blacklistedCount++;
        const result = errorOutputter(dependency);
        if (result !== "") {
          allOutputs.push(result);
          blackListOutputs.push(result);
        }
      }
    });

    return {
      uniqueCount: dependencies.length,
      whitelistedCount: whitelistedCount,
      warnCount: warnCount,
      blacklistedCount: blacklistedCount,
      allOutputs: allOutputs,
      blackListOutputs: blackListOutputs,
      warnOutputs: warnOutputs,
      whiteListOutputs: whiteListOutputs,
    };
  };

export default parserFactory;
