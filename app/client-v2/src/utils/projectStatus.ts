import type { StatusTypes } from "@/types/projectTypes";

export const hasSampleFailed = (statusType: StatusTypes | undefined, cluster: string | undefined) =>
  statusType === "failed" || (statusType === "finished" && !cluster);

export const hasSamplePassed = (statusType: StatusTypes | undefined, cluster: string | undefined) =>
  statusType === "finished" && !!cluster;
