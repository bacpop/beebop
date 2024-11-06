import type { StatusTypes } from "@/types/projectTypes";

export const hasSampleFailed = (statusType: StatusTypes | undefined, cluster: string | undefined) =>
  statusType === "failed" || (statusType === "finished" && !cluster);

export const hasSamplePassed = (statusType: StatusTypes | undefined, cluster: string | undefined) =>
  statusType === "finished" && !!cluster;

export const hasMicroreactPassed = (microreactClusterStatuses: Record<string, StatusTypes> | undefined ,  cluster: string | undefined): boolean => {
  if (microreactClusterStatuses && cluster) {
    return microreactClusterStatuses[cluster] === "finished";
  }
  return false;
}