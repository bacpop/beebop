export interface PoppunkRequest {
    names: Record<string, unknown>,
    projectHash: string,
    sketches: Record<string, never>
}

export interface BeebopRunRequest extends PoppunkRequest {
    projectName: string,
}