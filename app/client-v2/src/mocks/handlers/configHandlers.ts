import { getApiUrl } from "@/config";
import { http, HttpResponse } from "msw";
import { MOCK_SPECIES_CONFIG } from "../mockObjects";

export const speciesConfigIndexUri = `${getApiUrl()}/speciesConfig`;

export const configHandlers = [
  http.get(speciesConfigIndexUri, () =>
    HttpResponse.json({
      data: MOCK_SPECIES_CONFIG,
      errors: [],
      status: "success"
    })
  )
];
