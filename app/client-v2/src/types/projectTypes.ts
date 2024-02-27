export interface ProjectOverview {
  id: string;
  name: string;
  samplesCount: number;
  timestamp: string;
}
export interface ProjectsResponse {
  data: ProjectOverview[];
  errors: string[];
  status: string;
}

export interface AMR {
  filename: string;
  Penicillin: number;
  Chloramphenicol: number;
  Erythromycin: number;
  Tetracycline: number;
  Trim_sulfa: number; // Cotrim
  length: boolean;
  species: boolean;
}

export interface ProjectSample {
  hash: string;
  filename: string;
  amr?: AMR;
  sketch?: Record<string, unknown>;
  cluster?: number;
}

export interface Project {
  id: string;
  name: string;
  samples: ProjectSample[];
  timestamp: string;
  hash?: string;
  status?: {
    assign: StatusTypes;
    microreact: StatusTypes;
    network: StatusTypes;
  };
}
export type StatusTypes = "finished" | "failed" | "started" | "waiting" | "deferred" | "submitted";
export const COMPLETE_STATUS_TYPES: StatusTypes[] = ["finished", "failed"];

export interface AnalysisStatus {
  assign: StatusTypes;
  microreact: StatusTypes;
  network: StatusTypes;
}
export interface ApiResponse<T> {
  data: T;
  errors: string[];
  status: string;
}
export interface AssignCluster {
  [key: number]: ClusterInfo;
}
export interface ClusterInfo {
  cluster: number;
  hash: string;
}
export enum WorkerResponseValueTypes {
  AMR = "amr",
  SKETCH = "sketch"
}

export interface WorkerResponse {
  hash: string;
  type: WorkerResponseValueTypes;
  result: string;
}

export enum AnalysisType {
  ASSIGN = "assign",
  MICROREACT = "microreact",
  NETWORK = "network"
}
