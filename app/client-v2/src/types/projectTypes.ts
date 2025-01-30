import cytoscape from "cytoscape";
export interface ProjectOverview {
  id: string;
  name: string;
  samplesCount: number;
  timestamp: string;
  species: string;
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

export interface AMRForCsv {
  "Penicillin Resistance": string;
  "Chloramphenicol Resistance": string;
  "Erythromycin Resistance": string;
  "Tetracycline Resistance": string;
  "Cotrim Resistance": string;
}

export interface AMRMetadataCsv extends AMRForCsv {
  ID: string;
}
export interface ProjectSample {
  hash: string;
  filename: string;
  amr?: AMR;
  sketch?: Record<string, unknown>;
  cluster?: string;
  failReasons?: string[];
  hasRun?: boolean;
}

export interface Project {
  id: string;
  name: string;
  samples: ProjectSample[];
  timestamp: string;
  hash?: string;
  status?: AnalysisStatus;
  deletedAt?: string;
  species: string;
}

export type StatusTypes = "finished" | "failed" | "started" | "waiting" | "deferred" | "submitted";
export const COMPLETE_STATUS_TYPES: StatusTypes[] = ["finished", "failed"] as const;

// TODO update
export interface AnalysisStatus {
  assign: StatusTypes;
  visualise: StatusTypes;
  visualiseClusters: Record<string, StatusTypes>;
}
export interface ApiResponse<T> {
  data: T;
  errors: string[];
  status: string;
}

export interface ClusterInfo {
  cluster?: string;
  failReasons?: string[];
  hash: string;
}

export interface WorkerResponse {
  hash: string;
  filename: string;
  amr: AMR;
  sketch: Record<string, unknown>;
}

export interface HashedFile {
  hash: string;
  filename: string;
  file: File;
}

// TODO: update
export enum AnalysisType {
  ASSIGN = "assign",
  MICROREACT = "microreact",
  NETWORK = "network"
}

interface GraphmlExtension {
  graphml: (arg: Record<string, string> | string) => void;
}

export type CyGraphml = cytoscape.Core & GraphmlExtension;
