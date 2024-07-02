import { hasSampleFailed, hasSamplePassed } from "@/utils/projectStatus";

describe("projectStatus utilities", () => {
  describe("hasSampleFailed", () => {
    test('returns true when statusType is "failed"', () => {
      expect(hasSampleFailed("failed", "someCluster")).toBeTruthy();
      expect(hasSampleFailed("failed", undefined)).toBeTruthy();
    });

    test('returns true when statusType is "finished" and cluster is undefined', () => {
      expect(hasSampleFailed("finished", undefined)).toBeTruthy();
    });

    test('returns false when statusType is "finished" and cluster is defined', () => {
      expect(hasSampleFailed("finished", "someCluster")).toBeFalsy();
    });

    test('returns false when statusType is neither "failed" nor "finished"', () => {
      expect(hasSampleFailed("running", "someCluster")).toBeFalsy();
      expect(hasSampleFailed("running", undefined)).toBeFalsy();
    });

    test("returns false when statusType is undefined", () => {
      expect(hasSampleFailed(undefined, "someCluster")).toBeFalsy();
      expect(hasSampleFailed(undefined, undefined)).toBeFalsy();
    });
  });

  describe("hasSamplePassed", () => {
    test('returns true when statusType is "finished" and cluster is defined', () => {
      expect(hasSamplePassed("finished", "someCluster")).toBeTruthy();
    });

    test('returns false when statusType is "finished" and cluster is undefined', () => {
      expect(hasSamplePassed("finished", undefined)).toBeFalsy();
    });

    test('returns false when statusType is "failed"', () => {
      expect(hasSamplePassed("failed", "someCluster")).toBeFalsy();
      expect(hasSamplePassed("failed", undefined)).toBeFalsy();
    });

    test('returns false when statusType is neither "finished" nor "failed"', () => {
      expect(hasSamplePassed("waiting", "someCluster")).toBeFalsy();
      expect(hasSamplePassed("waiting", undefined)).toBeFalsy();
    });

    test("returns false when statusType is undefined", () => {
      expect(hasSamplePassed(undefined, "someCluster")).toBeFalsy();
      expect(hasSamplePassed(undefined, undefined)).toBeFalsy();
    });
  });
});
