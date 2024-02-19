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
  Trim_sulfa: number;
  length: boolean;
  species: boolean;
}
export interface ProjectSample {
  hash: string;
  filename: string;
  amr: AMR;
  sketch: Record<string, unknown>;
  cluster?: number;
}

export interface Project {
  id: string;
  name: string;
  samples: ProjectSample[];
  timestamp: string;
  hash?: string;
  status?: {
    assign: string;
    microreact: string;
    network: string;
  };
}
export interface ProjectResponse {
  data: Project[];
  errors: string[];
  status: string;
}
