import { ProjectUtils } from "./../utils/projectUtils";
import { ProjectNameRequest } from "../types/requestTypes";
import { userStore } from "../db/userStore";
import { handleAPIError, sendSuccess } from "../utils";
import asyncHandler from "../errors/asyncHandler";
import axios, { AxiosResponse } from "axios";
import { APIResponse, APIProjectResponse } from "../types/responseTypes";
import { AMR } from "../types/models";

export default (config) => {
  return {
    async getProjects(request, response, next) {
      await asyncHandler(next, async () => {
        const { redis } = request.app.locals;
        const projects = await userStore(redis).getUserProjects(request);
        sendSuccess(response, projects);
      });
    },

    async newProject(request, response) {
      const name = (request.body as ProjectNameRequest).name;
      const { redis } = request.app.locals;
      const projectId = await userStore(redis).saveNewProject(request, name);
      sendSuccess(response, projectId);
    },

    async renameProject(request, response) {
      const { projectId } = request.params;
      const name = (request.body as ProjectNameRequest).name;
      const { redis } = request.app.locals;
      await userStore(redis).renameProject(request, projectId, name);
      sendSuccess(response, null);
    },

    async getProject(request, response, next) {
      await asyncHandler(next, async () => {
        const { projectId } = request.params;
        const { redis } = request.app.locals;
        const store = userStore(redis);
        const baseProjectInfo = await store.getBaseProjectInfo(projectId);
        const projectSplitSampleIds = await store.getProjectSplitSampleIds(
          projectId
        );

        // If there is no project hash, then the project has not been submitted so will have no poppunk result data available from beebop_py yet
        if (!baseProjectInfo.hash) {
          const responseSamples = await ProjectUtils.getResponseSamples(
            store,
            projectId,
            projectSplitSampleIds
          );
          return sendSuccess(response, {
            id: projectId,
            ...baseProjectInfo,
            samples: responseSamples,
          });
        }

        let ranProjectResponse: AxiosResponse<APIResponse<APIProjectResponse>>;
        try {
          ranProjectResponse = await axios.get(
            `${config.api_url}/project/${baseProjectInfo?.hash}`
          );
        } catch (error) {
          return handleAPIError(request, response, error);
        }
        const apiData = ranProjectResponse.data.data;

        const responseSamples = await ProjectUtils.getResponseSamples(
          store,
          projectId,
          projectSplitSampleIds,
          apiData
        );
        return sendSuccess(response, {
          id: projectId,
          ...baseProjectInfo,
          ...apiData,
          samples: responseSamples,
        });
      });
    },

    async postAMR(request, response, next) {
      await asyncHandler(next, async () => {
        const amr = request.body as AMR;
        const { projectId, sampleHash } = request.params;
        const { redis } = request.app.locals;
        await userStore(redis).saveAMR(projectId, sampleHash, amr);
        sendSuccess(response, null);
      });
    },
    async postSketch(request, response, next) {
      await asyncHandler(next, async () => {
        const { sketch, filename } = request.body as {
          sketch: Record<string, unknown>;
          filename: string;
        };
        const { projectId, sampleHash } = request.params;
        const { redis } = request.app.locals;
        await userStore(redis).saveSketch(
          projectId,
          sampleHash,
          filename,
          sketch
        );
        sendSuccess(response, null);
      });
    },
    async deleteSample(request, response, next) {
      await asyncHandler(next, async () => {
        const { projectId, sampleHash } = request.params;
        const { redis } = request.app.locals;
        await userStore(redis).deleteSample(projectId, sampleHash);
        sendSuccess(response, null);
      });
    },
  };
};
