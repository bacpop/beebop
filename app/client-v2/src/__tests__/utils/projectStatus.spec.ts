import type { StatusTypes } from "@/types/projectTypes";
import {
  getVisualiseClusterStatus,
  hasVisualiseClusterFailed,
  hasVisualiseClusterPassed,
  hasSampleFailed,
  hasSamplePassed,
  isAnyVisualiseFinished,
  haveAnyVisualiseBeenQueued
} from "@/utils/projectStatus";

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
      expect(hasSampleFailed("waiting", "someCluster")).toBeFalsy();
      expect(hasSampleFailed("waiting", undefined)).toBeFalsy();
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
  describe("hasMicroreactClusterPassed", () => {
    test('returns true when visualiseClusterstatuses has the cluster with status "finished"', () => {
      const statuses: any = { cluster1: "finished", cluster2: "failed" };
      expect(hasVisualiseClusterPassed(statuses, "cluster1")).toBeTruthy();
    });

    test('returns false when visualiseClusterstatuses has the cluster with status not "finished"', () => {
      const statuses: any = { cluster1: "failed", cluster2: "waiting" };
      expect(hasVisualiseClusterPassed(statuses, "cluster1")).toBeFalsy();
    });

    test("returns false when visualiseClusterstatuses is undefined", () => {
      expect(hasVisualiseClusterPassed(undefined, "cluster1")).toBeFalsy();
    });

    test("returns false when cluster is undefined", () => {
      const statuses: any = { cluster1: "finished" };
      expect(hasVisualiseClusterPassed(statuses, undefined)).toBeFalsy();
    });
  });

  describe("hasMicroreactClusterFailed", () => {
    test('returns true when status.microreact is "failed"', () => {
      const status: any = { microreact: "failed", visualiseClusters: {} };
      expect(hasVisualiseClusterFailed(status, "cluster1")).toBeTruthy();
    });

    test("returns true when cluster is undefined and any microreact cluster has started", () => {
      const status: any = { microreact: "waiting", visualiseClusters: { cluster1: "deferred" } };
      expect(hasVisualiseClusterFailed(status, undefined)).toBeTruthy();
    });

    test('returns true when visualiseClusters has the cluster with status "failed"', () => {
      const status: any = { microreact: "waiting", visualiseClusters: { cluster1: "failed" } };
      expect(hasVisualiseClusterFailed(status, "cluster1")).toBeTruthy();
    });

    test("returns false when status and cluster do not meet any failure conditions", () => {
      const status: any = { microreact: "waiting", visualiseClusters: { cluster1: "waiting" } };
      expect(hasVisualiseClusterFailed(status, "cluster1")).toBeFalsy();
    });

    test("returns false when status is undefined", () => {
      expect(hasVisualiseClusterFailed(undefined, "cluster1")).toBeFalsy();
    });
  });

  describe("getvisualiseClusterstatus", () => {
    test("returns the status of the specified cluster", () => {
      const status: any = { microreact: "waiting", visualiseClusters: { cluster1: "finished" } };
      expect(getVisualiseClusterStatus(status, "cluster1")).toBe("finished");
    });

    test("returns the microreact status when cluster is undefined", () => {
      const status: any = { microreact: "waiting", visualiseClusters: { cluster1: "finished" } };
      expect(getVisualiseClusterStatus(status, undefined)).toBe("waiting");
    });

    test('returns "waiting" when status is undefined', () => {
      expect(getVisualiseClusterStatus(undefined, "cluster1")).toBe("waiting");
    });

    test('returns "waiting" when cluster is not found in visualiseClusters', () => {
      const status: any = { microreact: "waiting", visualiseClusters: { cluster1: "finished" } };
      expect(getVisualiseClusterStatus(status, "cluster2")).toBe("waiting");
    });
  });

  describe("isAnyMicroreactFinished", () => {
    test('returns true when any microreact cluster status is "finished"', () => {
      const statuses: any = { cluster1: "finished", cluster2: "waiting" };
      expect(isAnyVisualiseFinished(statuses)).toBeTruthy();
    });
    test('returns true when any microreact cluster status is "failed"', () => {
      const statuses: any = { cluster1: "failed", cluster2: "waiting" };
      expect(isAnyVisualiseFinished(statuses)).toBeTruthy();
    });

    test("returns false when no microreact cluster status is finished", () => {
      const statuses: any = { cluster1: "waiting", cluster2: "deferred" };
      expect(isAnyVisualiseFinished(statuses)).toBeFalsy();
    });

    test("returns false when visualiseClusterstatuses is undefined", () => {
      expect(isAnyVisualiseFinished(undefined)).toBeFalsy();
    });
  });

  describe("isAnyMicroreactQueued", () => {
    test("returns true when visualiseClusterstatuses is not empty", () => {
      const statuses: Record<string, StatusTypes> = { cluster1: "finished" };
      expect(haveAnyVisualiseBeenQueued(statuses)).toBeTruthy();
    });

    test("returns false when visualiseClusterstatuses is empty", () => {
      const statuses: Record<string, StatusTypes> = {};
      expect(haveAnyVisualiseBeenQueued(statuses)).toBeFalsy();
    });

    test("returns false when visualiseClusterstatuses is undefined", () => {
      expect(haveAnyVisualiseBeenQueued(undefined)).toBeFalsy();
    });
  });
});
