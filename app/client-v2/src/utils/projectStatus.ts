import {
  COMPLETE_STATUS_TYPES,
  type AnalysisStatus,
  type SampleFailType,
  type StatusTypes,
  type Sublineage
} from "@/types/projectTypes";

export const hasSampleFailed = (statusType: StatusTypes | undefined, cluster: string | undefined) =>
  statusType === "failed" || (statusType === "finished" && !cluster);

export const hasSampleFailedWithWarning = (
  statusType: StatusTypes | undefined,
  cluster: string | undefined,
  failType: SampleFailType | undefined
) => hasSampleFailed(statusType, cluster) && failType === "warning";

export const hasSamplePassed = (statusType: StatusTypes | undefined, cluster: string | undefined) =>
  statusType === "finished" && Boolean(cluster);

export const hasVisualiseClusterPassed = (
  visualiseClusterstatuses: Record<string, StatusTypes> | undefined,
  cluster: string | undefined
): boolean => {
  if (visualiseClusterstatuses && cluster) {
    return visualiseClusterstatuses[cluster] === "finished";
  }
  return false;
};

export const hasVisualiseClusterFailed = (status: AnalysisStatus | undefined, cluster: string | undefined): boolean => {
  // occurs when this sample could not be assigned to a cluster but at least one other sample was assigned
  if (!cluster && haveAnyVisualiseBeenQueued(status?.visualiseClusters)) return true;

  if (status?.visualise == "failed" || (cluster && status?.visualiseClusters?.[cluster] === "failed")) return true;

  return false;
};

export const getVisualiseClusterStatus = (
  status: AnalysisStatus | undefined,
  cluster: string | undefined
): StatusTypes => {
  if (cluster && status?.visualiseClusters?.[cluster]) {
    return status.visualiseClusters[cluster];
  }

  return status?.visualise || "waiting";
};

export const haveAnyVisualiseBeenQueued = (
  visualiseClusterStatuses: Record<string, StatusTypes> | undefined
): boolean => Object.keys(visualiseClusterStatuses || {}).length !== 0;

export const isAnyVisualiseFinished = (visualiseClusterStatuses: Record<string, StatusTypes> | undefined): boolean =>
  Object.values(visualiseClusterStatuses || {}).some((status) => COMPLETE_STATUS_TYPES.includes(status));

export const isAllVisualiseFinished = (visualiseClusterStatuses: Record<string, StatusTypes> | undefined): boolean => {
  const statusValues = Object.values(visualiseClusterStatuses || {});
  return statusValues.length > 0 && statusValues.every((status) => COMPLETE_STATUS_TYPES.includes(status));
};

export const isSublineageUnavailable = (
  status: AnalysisStatus | undefined,
  sublineage: Sublineage | undefined
): boolean => status?.sublineageAssign === "finished" && !sublineage;

export const hasSublineagePassed = (status: StatusTypes | undefined, sublineage: Sublineage | undefined): boolean =>
  status === "finished" && Boolean(sublineage);

// Considered failed if sublineageAssign is failed or if cluster assign is finished but no cluster was assigned
export const hasSublineageFailed = (status: AnalysisStatus | undefined, cluster: string | undefined): boolean =>
  status?.sublineageAssign === "failed" || (status?.assign === "finished" && !cluster);
