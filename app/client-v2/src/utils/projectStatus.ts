import { COMPLETE_STATUS_TYPES, type AnalysisStatus, type StatusTypes } from "@/types/projectTypes";

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
  status: AnalysisStatus | undefined,
  cluster: string | undefined
): boolean => {
  // occurs when another sample has passed but this one fails
  if (!cluster && isAnyMicroreactQueued(status?.microreactClusters)) return true;

  if (status?.microreact == "failed" || (cluster && status?.microreactClusters?.[cluster] === "failed")) return true;

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

export const isAnyMicroreactQueued = (microreactClusterStatuses: Record<string, StatusTypes> | undefined): boolean => {
  return Object.keys(microreactClusterStatuses || {}).length !== 0;
};

export const isAnyMicroreactFinished = (
  microreactClusterStatuses: Record<string, StatusTypes> | undefined
): boolean => {
  return Object.values(microreactClusterStatuses || {}).some((status) => COMPLETE_STATUS_TYPES.includes(status));
};
