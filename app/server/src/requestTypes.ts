export interface PoppunkRequest {
    names: Record<string, unknown>,
    projectHash: string,
    sketches: Record<string, never>
}

export interface BeebopRunRequest extends PoppunkRequest {
    projectId: string,
}

export interface NewProjectRequest {
    name: string
}

export interface PostAMRRequest {
    filename: string,
    Penicillin: number,
    Chloramphenicol: number,
    Erythromycin: number,
    Tetracycline: number,
    Trim_sulfa: number,
    length: boolean,
    species: boolean
}