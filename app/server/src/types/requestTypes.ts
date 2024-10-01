import { AMR } from "./models";

export interface PoppunkRequest {
    names: Record<string, string>,
    projectHash: string,
    sketches: Record<string, never>
    species: string
}

export interface BeebopRunRequest extends PoppunkRequest {
    projectId: string,
}

export interface ProjectNameRequest {
    name: string
}

export interface AddSamplesRequest {
  sketch: Record<string, unknown>;
  hash: string;
  amr: AMR;
  filename: string;
}
