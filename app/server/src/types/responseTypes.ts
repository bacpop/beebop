import {AMR} from "./models";

export interface ProjectResponse {
    samples: {
        hash: string,
        amr?: AMR
    }[]
}