import { getApiUrl } from "@/config";
import { HttpHandler, HttpResponse, http } from "msw";
import { MOCK_USER } from "../mockObjects";

export const userIndexUri = `${getApiUrl()}/user`;

export const userHandlers: HttpHandler[] = [
  http.get(userIndexUri, () =>
    HttpResponse.json({
      data: MOCK_USER,
      errors: [],
      status: "success"
    })
  )
];
