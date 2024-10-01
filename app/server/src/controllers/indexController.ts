import axios from "axios";
import asyncHandler from "../errors/asyncHandler";
import {BeebopRunRequest, PoppunkRequest} from "../types/requestTypes";
import {userStore} from "../db/userStore";
import {handleAPIError} from "../utils";

export default (config) => {
    return {
        async getVersionInfo(request, response) {
            await axios.get(`${config.api_url}/version`)
                .then(res => response.send(res.data));
        },

        async runPoppunk(request, response, next) {
            await asyncHandler(next, async () => {
                const poppunkRequest = request.body as BeebopRunRequest;
                const {projectHash, projectId, names, sketches, species } = poppunkRequest;
                const {redis} = request.app.locals;
                await userStore(redis).saveHashAndSamplesRun(request, projectId, projectHash, names);
                const apiRequest = {names, projectHash, sketches, species} as PoppunkRequest;
                await axios.post(`${config.api_url}/poppunk`,
                    apiRequest,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        maxContentLength: 1000000000,
                        maxBodyLength: 1000000000
                    },
                )
                    .then(res => response.send(res.data))
                    .catch(function (error) {
                        handleAPIError(request, response, error);
                    })
            });
        },

        async getStatus(request, response) {
            await axios.get(`${config.api_url}/status/${request.body.hash}`)
                .then(res => response.send(res.data))
                .catch(function (error) {
                    handleAPIError(request, response, error);
                });
        },

        async getAssignResult(request, response) {
            await axios.post(`${config.api_url}/results/assign`,
                request.body,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => response.send(res.data))
                .catch(function (error) {
                    handleAPIError(request, response, error);
                });
        },

        async downloadGraphml (request, response) {
            await axios.post(`${config.api_url}/results/graphml`,
                request.body,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => response.send(res.data))
                .catch(function (error) {
                    handleAPIError(request, response, error);
                });
        },
        async getNetworkGraphs(request, response) {
            try {
                const res = await axios.get(`${config.api_url}/results/networkGraphs/${request.params.projectHash}`);
                return response.send(res.data);
            } catch (error) {
                return handleAPIError(request, response, error);
            }
        },

        async downloadZip(request, response) {
            await axios.post(`${config.api_url}/results/zip`,
                request.body,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer',
                })
                .then(res => response.send(res.data))
                .catch(function (error) {
                    handleAPIError(request, response, error);
                });
        },

        async microreactURL(request, response) {
            await axios.post(`${config.api_url}/results/microreact`,
                request.body,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => {
                    response.send(res.data)
                })
                .catch(function (error) {
                    handleAPIError(request, response, error);
                });
        },
    }
}