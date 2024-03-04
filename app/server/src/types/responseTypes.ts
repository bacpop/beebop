import { AMR } from "./models";

export interface APIResponse<T> {
  status: "success" | "failure";
  data: T | null;
  errors: {
    error: string;
    detail: string;
  }[];
}

export interface APIProjectResponse {
  samples: {
    hash: string;
    amr?: AMR;
    cluster: number;
    sketch: Record<string, unknown>;
  }[];
  status: {
    assign: string;
    microreact: string;
    network: string;
  };
}
