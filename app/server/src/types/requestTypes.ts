export interface PoppunkRequest {
    names: Record<string, string>,
    projectHash: string,
    sketches: Record<string, never>
}

export interface BeebopRunRequest extends PoppunkRequest {
    projectId: string,
}

export interface ProjectNameRequest {
    name: string
}