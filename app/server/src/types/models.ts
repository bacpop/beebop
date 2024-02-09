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

export interface ProjectSample {
    hash: string;
    filename: string;
    amr: AMR;
    sketch: Record<string, unknown>;
    cluster?: number;
  }