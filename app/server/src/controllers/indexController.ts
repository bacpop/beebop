import axios from "axios";
import asyncHandler from "../errors/asyncHandler";
import {BeebopRunRequest, PoppunkRequest} from "../types/requestTypes";
import {userStore} from "../db/userStore";
import {handleAPIError, sendSuccess} from "../utils";

export default (config) => {
    return {
        async getVersionInfo(request, response) {
            await axios.get(`${config.api_url}/version`)
                .then(res => response.send(res.data));
        },

        async runPoppunk(request, response, next) {
            await asyncHandler(next, async () => {
                const poppunkRequest = request.body as BeebopRunRequest;
                const {projectHash, projectId, names, sketches} = poppunkRequest;
                const {redis} = request.app.locals;
                await userStore(redis).saveProjectHash(request, projectId, projectHash);
                const apiRequest = {names, projectHash, sketches} as PoppunkRequest;
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

        async saveMicroreactToken(request, response) {
            const {redis} = request.app.locals;
            const { token } = request.body;
            console.log("persisting microreact token: " + token)
            await userStore(redis).saveMicroreactToken(request, token);
            sendSuccess(response, null);
        },

        async getMicroreactToken(request, response) {
            const {redis} = request.app.locals;
            const token = await userStore(redis).getMicroreactToken(request);
            sendSuccess(response, token);
        }
    }
}