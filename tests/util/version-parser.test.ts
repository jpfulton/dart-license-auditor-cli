import {
  isValidPubDevVersion,
  parseVersion,
  VersionParseError,
} from "../../src/util/version-parser";

describe("version-parser", () => {
  describe("parseVersion", () => {
    // Test basic version formats
    it("should handle raw version numbers", () => {
      expect(parseVersion("1.2.3")).toBe("1.2.3");
      expect(parseVersion("0.0.1")).toBe("0.0.1");
      expect(parseVersion("10.20.30")).toBe("10.20.30");
    });

    it("should handle caret syntax", () => {
      expect(parseVersion("^1.2.3")).toBe("1.2.3");
      expect(parseVersion("^0.0.1")).toBe("0.0.1");
      expect(parseVersion("^10.20.30")).toBe("10.20.30");
    });

    it("should handle version ranges with >= syntax", () => {
      expect(parseVersion(">=1.2.3 <2.0.0")).toBe("1.2.3");
      expect(parseVersion(">=1.2.3")).toBe("1.2.3");
    });

    // Test pre-release and build metadata
    it("should handle pre-release versions", () => {
      expect(parseVersion("1.2.3-beta")).toBe("1.2.3-beta");
      expect(parseVersion("1.2.3-alpha.1")).toBe("1.2.3-alpha.1");
      expect(parseVersion("^1.2.3-dev.1")).toBe("1.2.3-dev.1");
    });

    it("should handle build metadata", () => {
      expect(parseVersion("1.2.3+build.123")).toBe("1.2.3+build.123");
      expect(parseVersion("1.2.3-alpha+build.123")).toBe(
        "1.2.3-alpha+build.123"
      );
      expect(parseVersion("^1.2.3+build.123")).toBe("1.2.3+build.123");
    });

    // Test error cases
    it("should throw for 'any' version", () => {
      expect(() => parseVersion("any")).toThrow(VersionParseError);
      expect(() => parseVersion("ANY")).toThrow(VersionParseError);
    });

    it("should throw for invalid version formats", () => {
      expect(() => parseVersion("1.2")).toThrow(VersionParseError);
      expect(() => parseVersion("1.2.3.4")).toThrow(VersionParseError);
      expect(() => parseVersion("1.2.3a")).toThrow(VersionParseError);
      expect(() => parseVersion("latest")).toThrow(VersionParseError);
      expect(() => parseVersion("")).toThrow(VersionParseError);
    });
  });

  describe("isValidPubDevVersion", () => {
    it("should return true for valid versions", () => {
      expect(isValidPubDevVersion("1.2.3")).toBe(true);
      expect(isValidPubDevVersion("^1.2.3")).toBe(true);
      expect(isValidPubDevVersion("1.2.3-beta")).toBe(true);
      expect(isValidPubDevVersion("1.2.3+build.123")).toBe(true);
      expect(isValidPubDevVersion(">=1.2.3 <2.0.0")).toBe(true);
    });

    it("should return false for invalid versions", () => {
      expect(isValidPubDevVersion("any")).toBe(false);
      expect(isValidPubDevVersion("1.2")).toBe(false);
      expect(isValidPubDevVersion("latest")).toBe(false);
      expect(isValidPubDevVersion("")).toBe(false);
    });
  });
});
