import {ProjectNameRequest} from "../types/requestTypes";
import {userStore} from "../db/userStore";
import {handleAPIError, sendSuccess} from "../utils";
import asyncHandler from "../errors/asyncHandler";
import axios, {AxiosResponse} from "axios";
import {APIResponse, ProjectResponse} from "../types/responseTypes";
import {BeebopError} from "../errors/beebopError";
import {AMR} from "../types/models";

export default (config) => {
    return {
        async getProjects(request, response, next) {
            await asyncHandler(next, async () => {
                const {redis} = request.app.locals;
                const projects = await userStore(redis).getUserProjects(request);
                sendSuccess(response, projects);
            });
        },

        async newProject(request, response) {
            const name = (request.body as ProjectNameRequest).name;
            const {redis} = request.app.locals;
            const projectId = await userStore(redis).saveNewProject(request, name);
            sendSuccess(response, projectId);
        },

        async renameProject(request, response) {
            const {projectId} = request.params;
            const name = (request.body as ProjectNameRequest).name;
            const {redis} = request.app.locals;
            await userStore(redis).renameProject(request, projectId, name);
            sendSuccess(response, null);
        },

        async getProject(request, response, next) {
            await asyncHandler(next, async () => {
                const {projectId} = request.params;
                const {redis} = request.app.locals;
                const store = userStore(redis);
                const projectHash = await store.getProjectHash(request, projectId);
                console.log(`PROJECT HASH IS ${projectHash}`)
                const res = await axios.get<APIResponse<ProjectResponse>>(`${config.api_url}/project/${projectHash}`)
                    .catch(function (error) {
                        handleAPIError(request, response, error);
                    });
                if (res) {
                    const apiData = (res as AxiosResponse<APIResponse<ProjectResponse>>).data.data;
                    // Get each project sample (sample hash and filename) from redis and find the
                    // corresponding sample (by hash) in the response from beebop_py api (containing cluster info etc) -
                    // combine data from both in response to client
                    const projectSamples = await store.getProjectSamples(projectId);
                    const responseSamples = [];
                    for (const sample of projectSamples) {
                        const apiSample = apiData.samples.find(s => s.hash === sample.hash);
                        if (!apiSample) {
                            throw new BeebopError("Invalid data",`Sample with hash ${sample.hash} was not in API response`);
                        }
                        const amr = await store.getAMR(projectId, sample.hash, sample.filename);
                        responseSamples.push({
                            ...apiSample,
                            filename: sample.filename,
                            amr
                        });
                    }
                    apiData.samples = responseSamples;
                    sendSuccess(response, apiData);
                }
            });
        },

        async postAMR(request, response, next) {
            await asyncHandler(next, async () => {
                const amr = request.body as AMR;
                const {projectId, sampleHash} = request.params;
                const {redis} = request.app.locals;
                await userStore(redis).saveAMR(projectId, sampleHash, amr);
                sendSuccess(response, null);
            });
        }
    }
}