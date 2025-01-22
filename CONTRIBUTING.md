# Contributing

Thanks for being here! Contributions to this project are both welcome and encouraged.

## Opening an Issue

All contributions start with [an issue](https://github.com/jpfulton/dart-license-auditor-cli/issues/new/choose).
Even if you have a good idea of what the problem is and what the solution looks like,
please open an issue. This will give us an opportunity to align on the problem and solution.
Templates are available for both bug reports and feature requests.

## Local Development

### Getting Started

To get started:

**Step 1: Fork this repo**

Fork by clicking [here](https://github.com/jpfulton/dart-license-auditor-cli/fork).

**Step 2: Clone your fork and open in VSCode**

```sh
git clone <your fork>
cd dart-license-auditor-cli
code .
```

**Step 3: Install dependencies**

```sh
yarn install
```

**Step 4: Build the project**

```sh
yarn build
```

**Step 5: Run the test suite**

```sh
yarn test
```

### Running the CLI

To run the CLI locally, use the following command:

```sh
yarn execute <command> <options> <arguments>
```

For example, to run the CLI in the current directory, use the following command:

```sh
yarn execute markdown .
```

### Running the CLI in Debug Mode

To run the CLI in debug mode, use the following command:

```sh
yarn debug <command> <options> <arguments>
```

For example, to run the CLI in debug mode in the current directory, use the following command:

```sh
yarn debug markdown .
```
