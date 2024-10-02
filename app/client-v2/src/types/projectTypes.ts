import cytoscape from "cytoscape";
export interface ProjectOverview {
  id: string;
  name: string;
  samplesCount: number;
  timestamp: string;
  species: Species;
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
  status?: {
    assign: StatusTypes;
    microreact: StatusTypes;
    network: StatusTypes;
  };
  deletedAt?: string;
  species: Species;
}
export type StatusTypes = "finished" | "failed" | "started" | "waiting" | "deferred" | "submitted";
export const COMPLETE_STATUS_TYPES: StatusTypes[] = ["finished", "failed"] as const;

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

export enum AnalysisType {
  ASSIGN = "assign",
  MICROREACT = "microreact",
  NETWORK = "network"
}

interface GraphmlExtension {
  graphml: (arg: Record<string, string> | string) => void;
}

export type CyGraphml = cytoscape.Core & GraphmlExtension;

export const SPECIES = ["Streptococcus pneumoniae", "Streptococcus agalactiae"] as const;
export type Species = (typeof SPECIES)[number];

export interface SketchKmerArguments {
  kmerMin: number;
  kmerMax: number;
  kmerStep: number;
}
