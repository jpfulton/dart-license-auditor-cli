# dart-license-auditor-cli

[![ci](https://github.com/jpfulton/dart-license-auditor-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/jpfulton/dart-license-auditor-cli/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/%40jpfulton%2Fdart-license-auditor-cli.svg)](https://www.npmjs.com/package/@jpfulton/dart-license-auditor-cli)
![License](https://img.shields.io/badge/License-MIT-blue)
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=jpfulton.dart-license-auditor-cli)

A CLI designed to list and audit licenses in project dependencies in Dart projects. The CLI
can output both markdown reports and CSV files and is designed to run in CI workflows.
Included in the package is a [DangerJS](https://danger.systems/js) plugin that can be
used to audit licenses in the PR process.

## Installation of the CLI

You can install this tool globally, using the following yarn command:

```bash
yarn global add @jpfulton/dart-license-auditor-cli
```

## Local Configuration

To override the default configuration, which is extremely minimal, place a `.license-checker.json` file in the
root directory of your project with the following format:

```json
{
  "blackList": ["blacklisted-license"],
  "whiteList": ["whitelisted-license"]
}
```

Licenses in the blackList array will generate errors in the report. Licenses in the
whiteList array will generate information lines and licenses types that exist in neither
array generate warnings for further investigation.

## Remote Configurations

Remote configurations can be used to override the default configuration. To use a remote
configuration, specify the URL to the configuration file using the `--remote-config` flag.
Remote configurations are useful when applying the same configuration to multiple projects
to avoid the need to copy the configuration file to each project and maintain the configurations
in multiple places.

```bash
dart-license-auditor-cli csv --remote-config https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/.license-checker.json . > report.csv
```

```bash
dart-license-auditor-cli markdown --remote-config https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/.license-checker.json . > report.md
```

## Usage as a DangerJS Plugin

This project can be used as a [DangerJS](https://danger.systems/js/) plugin. To use the
plugin, install the plugin using the following command:

```bash
yarn add -D danger @jpfulton/dart-license-auditor-cli
```

Then, add the following to your `dangerfile.ts`:

```typescript
import { licenseAuditor } from "@jpfulton/dart-license-auditor-cli";

export default async () => {
  // Run the license auditor plugin
  await licenseAuditor({
    // optionally choose to fail the build if a blacklisted license is found
    failOnBlacklistedLicense: false,
    // specify the path to the project's pubspec.yaml file, useful in a monorepo
    // defaults to the current working directory
    projectPath: ".",
    // optionally specify a remote configuration file
    // useful when applying the same configuration to multiple projects
    // defaults to usage of a local configuration file found at the root of the project repo
    remoteConfigurationUrl:
      "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/.license-checker.json",
    // show a summary of the license audit in the PR comment
    // includes the number of unique dependencies and counts for each category of license found
    showMarkdownSummary: true,
    // show details of the license audit in the PR comment
    // includes a table with the name, version and license of each dependency
    // that was discovered that was not explicitly whitelisted in the configuration
    showMarkdownDetails: true,
  });
};
```
