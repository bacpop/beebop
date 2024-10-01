import axios, { AxiosResponse } from "axios";
import { userStore } from "../db/userStore";
import asyncHandler from "../errors/asyncHandler";
import { handleError } from "../errors/handleError";
import { BaseProjectInfo } from "../types/models";
import {
  AddSamplesRequest,
  CreateProjectRequest,
  ProjectNameRequest,
} from "../types/requestTypes";
import { APIProjectResponse, APIResponse } from "../types/responseTypes";
import { handleAPIError, sendSuccess } from "../utils";
import { ProjectUtils } from "./../utils/projectUtils";

export default (config) => {
  return {
    async getProjects(request, response, next) {
      await asyncHandler(next, async () => {
        const { redis } = request.app.locals;
        const projects = await userStore(redis).getUserProjects(request);
        sendSuccess(response, projects);
      });
    },

    async newProject(request, response, next) {
      await asyncHandler(next, async () => {
        const { name, species } = request.body as CreateProjectRequest;
        const { redis } = request.app.locals;
        const projectId = await userStore(redis).saveNewProject(request, name, species);
        sendSuccess(response, projectId);
      });
    },

    async renameProject(request, response, next) {
      await asyncHandler(next, async () => {
        const { projectId } = request.params;
        const name = (request.body as ProjectNameRequest).name;
        const { redis } = request.app.locals;
        await userStore(redis).renameProject(request, projectId, name);
        sendSuccess(response, null);
      });
    },

    async getProject(request, response, next) {
      await asyncHandler(next, async () => {
        const { projectId } = request.params;
        const { redis } = request.app.locals;
        const store = userStore(redis);
        let baseProjectInfo: BaseProjectInfo;
        try {
          baseProjectInfo = await store.getBaseProjectInfo(projectId);
        } catch (error) {
          return handleError(error, request, response, null);
        }

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

    async deleteProject(request, response, next) {
      await asyncHandler(next, async () => {
        const { projectId } = request.params;
        const { redis } = request.app.locals;
        await userStore(redis).deleteProject(request, projectId);
        sendSuccess(response, null);
      });
    },

    async deleteSample(request, response, next) {
      await asyncHandler(next, async () => {
        const { projectId, sampleHash } = request.params;
        const { filename } = request.body as {
          filename: string;
        };
        const { redis } = request.app.locals;
        await userStore(redis).deleteSample(projectId, sampleHash, filename);
        sendSuccess(response, null);
      });
    },

    async addSamples(request, response, next) {
      await asyncHandler(next, async () => {
        const samples = request.body as AddSamplesRequest[];
        const { projectId } = request.params;
        const { redis } = request.app.locals;

        await userStore(redis).saveSamples(projectId, samples);
        sendSuccess(response, null);
      });
    },
  };
};
