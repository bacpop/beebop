import { getApiUrl } from "@/config";
import { http, HttpResponse } from "msw";
import { MOCK_LOCATION_METADATA, MOCK_SPECIES_CONFIG } from "../mockObjects";

export const speciesConfigIndexUri = `${getApiUrl()}/speciesConfig`;
export const locationMetadataConfigUri = `${getApiUrl()}/locationMetadata/:species`;

export const configHandlers = [
  http.get(speciesConfigIndexUri, () =>
    HttpResponse.json({
      data: MOCK_SPECIES_CONFIG,
      errors: [],
      status: "success"
    })
  ),
  http.get(locationMetadataConfigUri, () =>
    HttpResponse.json({
      data: MOCK_LOCATION_METADATA,
      errors: [],
      status: "success"
    })
  )
];
