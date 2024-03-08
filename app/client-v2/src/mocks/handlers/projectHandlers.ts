import { getApiUrl } from "@/config";
import { HttpHandler, HttpResponse, http } from "msw";
import { MOCK_PROJECT, MOCK_PROJECTS, MOCK_PROJECT_SAMPLES } from "../mockObjects";
import type { ClusterInfo } from "@/types/projectTypes";

export const projectIndexUri = `${getApiUrl()}/project`;
export const assignResultUri = `${getApiUrl()}/assignResult`;
export const statusUri = `${getApiUrl()}/status`;

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
  http.post(`${projectIndexUri}/:id/rename`, () => HttpResponse.json({ data: null, errors: [], status: "success" })),
  http.get(`${projectIndexUri}/:id`, () => HttpResponse.json({ data: MOCK_PROJECT, errors: [], status: "success" })),
  http.post(assignResultUri, () =>
    HttpResponse.json({
      data: {
        0: { hash: MOCK_PROJECT_SAMPLES[0].hash, cluster: MOCK_PROJECT_SAMPLES[0].cluster } as ClusterInfo,
        1: { hash: MOCK_PROJECT_SAMPLES[1].hash, cluster: MOCK_PROJECT_SAMPLES[1].cluster } as ClusterInfo,
        2: { hash: MOCK_PROJECT_SAMPLES[2].hash, cluster: MOCK_PROJECT_SAMPLES[2].cluster } as ClusterInfo
      },
      errors: [],
      status: "success"
    })
  ),
  http.post(statusUri, () =>
    HttpResponse.json({
      data: MOCK_PROJECT.status,
      errors: [],
      status: "success"
    })
  )
];
