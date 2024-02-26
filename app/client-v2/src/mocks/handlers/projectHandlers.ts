import { getApiUrl } from "@/config";
import { HttpHandler, HttpResponse, http } from "msw";
import { MOCK_PROJECTS } from "../mockObjects";

export const projectIndexUri = `${getApiUrl()}/project`;

export const projectHandlers: HttpHandler[] = [
  http.get(`${projectIndexUri}s`, () =>
    HttpResponse.json({
      data: MOCK_PROJECTS,
      errors: [],
      status: "success"
    })
  ),
  http.post(projectIndexUri, () =>
    HttpResponse.json({
      data: MOCK_PROJECTS[0].id,
      errors: [],
      status: "success"
    })
  ),
  http.post(`${projectIndexUri}/:id/rename`, () => HttpResponse.json({ data: null, errors: [], status: "success" }))
];
