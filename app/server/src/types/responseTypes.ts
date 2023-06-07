import {AMR} from "./models";

export interface APIResponse<T> {
    status: "success" | "failure",
    data: T | null,
    errors: {
        error: string,
        detail: string
    }[]
}

export interface ProjectResponse {
    samples: {
        hash: string,
        amr?: AMR
    }[]
}