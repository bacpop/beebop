export interface AMR {
    filename: string,
    Penicillin: number,
    Chloramphenicol: number,
    Erythromycin: number,
    Tetracycline: number,
    Trim_sulfa: number,
    length: boolean,
    species: boolean
}

export interface SplitSampleId {
    hash: string;
    filename: string;
}
export interface BaseProjectInfo {
    name: string;
    hash?: string;
    timestamp: string;
}
export interface ProjectSample extends SplitSampleId {
    amr: AMR;
    sketch: Record<string, unknown>;
    cluster?: number;
  }