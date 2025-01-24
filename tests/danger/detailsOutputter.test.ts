import { detailsOutputter } from "../../src/danger/danger-plugin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;

// detailsOutputter is a function that takes an array of strings and outputs them as a markdown table
describe("detailsOutputter", () => {
  beforeEach(() => {
    global.markdown = jest.fn();
  });

  afterEach(() => {
    global.markdown = undefined;
  });

  it("should call markdown with the correct parameters", () => {
    // arrange
    const message = `### License Details`;
    const tableHeaderMarkdown = `| Status | Package Name | Version | License |
|---|---|---|---|`;
    const outputs = ["test", "test2"];

    // act
    detailsOutputter(outputs);

    // assert
    expect(global.markdown).toHaveBeenNthCalledWith(1, message);
    expect(global.markdown).toHaveBeenNthCalledWith(
      2,
      `${tableHeaderMarkdown}\n${outputs.join("\n")}`
    );
  });
});
