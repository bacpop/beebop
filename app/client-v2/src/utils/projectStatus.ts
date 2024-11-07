import type { AnalysisStatus, StatusTypes } from "@/types/projectTypes";

export const hasSampleFailed = (statusType: StatusTypes | undefined, cluster: string | undefined) =>
  statusType === "failed" || (statusType === "finished" && !cluster);

export const hasSamplePassed = (statusType: StatusTypes | undefined, cluster: string | undefined) =>
  statusType === "finished" && !!cluster;

export const hasMicroreactClusterPassed = (
  microreactClusterStatuses: Record<string, StatusTypes> | undefined,
  cluster: string | undefined
): boolean => {
  if (microreactClusterStatuses && cluster) {
    return microreactClusterStatuses[cluster] === "finished";
  }
  return false;
};

export const hasMicroreactClusterFailed = (
  microreactClusterStatuses: Record<string, StatusTypes> | undefined,
  cluster: string | undefined
): boolean => {
  if (!cluster && Object.values(microreactClusterStatuses || {}).some((status) => status == "finished")) return true;

  if (cluster && microreactClusterStatuses?.[cluster] === "failed") return true;

  return false;
};

export const getMicroreactClusterStatus = (
  status: AnalysisStatus | undefined,
  cluster: string | undefined
): StatusTypes => {
  if (cluster && status?.microreactClusters?.[cluster]) {
    return status.microreactClusters[cluster];
  }

  return status?.microreact || "waiting";
};
