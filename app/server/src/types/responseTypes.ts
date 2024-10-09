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
  samples: Record<
    string,
    {
      hash: string;
      amr?: AMR;
      cluster?: number;
      sketch: Record<string, unknown>;
      failReasons?: string[];
    }
  >;
  status: {
    assign: string;
    microreact: string;
    network: string;
  };
}
export interface SketchKmerArguments {
  kmerMin: number;
  kmerMax: number;
  kmerStep: number;
}


