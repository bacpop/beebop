import { AMR } from "./models";

export interface PoppunkRequest {
    names: Record<string, string>,
    projectHash: string,
    sketches: Record<string, never>
    species: string,
    amrForMetadataCsv: AMRMetadataCsv[]
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
export interface BeebopRunRequest extends PoppunkRequest {
    projectId: string,
}

export interface ProjectNameRequest {
    name: string
}

export interface CreateProjectRequest extends ProjectNameRequest {
    species: string
}
export interface AddSamplesRequest {
  sketch: Record<string, unknown>;
  hash: string;
  amr: AMR;
  filename: string;
}
