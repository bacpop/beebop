import axios from 'axios';
import passport from 'passport';
import {BeebopRunRequest, NewProjectRequest, PoppunkRequest} from "../types/requestTypes";
import {AMR} from "../types/models";
import {userStore} from "../db/userStore";
import asyncHandler from "../errors/asyncHandler";
import {ProjectResponse} from "../types/responseTypes";

export const router = ((app, config) => {
    app.get('/',
        (request, response) => {
            response.json({
                message: 'Welcome to beebop!'
            });
        }
    );

    const api = apiEndpoints(config);

    app.get('/version',
        api.getVersionInfo);

    app.post('/project',
        authCheck,
        api.newProject);

    app.post('/poppunk',
        authCheck,
        api.runPoppunk);

    app.get('/projects',
        authCheck,
        api.getProjects);

    app.get('/project/:projectId',
        authCheck,
        api.getProject);

    app.post('/status',
        authCheck,
        api.getStatus);

    app.post('/assignResult',
        authCheck,
        api.getAssignResult);

    app.get('/login/google',
        passport.authenticate('google', { scope: ['profile'] }));

    app.get('/login/github',
        passport.authenticate('github', { scope: ['profile'] }));

    app.get('/user',
        authCheck,
        (request, response) => {
            if (request.user.provider == 'github') {
                sendSuccess(response, {
                    id: request.user.id,
                    provider: request.user.provider,
                    name: request.user.username
                });
            } else {
                sendSuccess(response, {
                    id: request.user.id,
                    provider: request.user.provider,
                    name: request.user.name.givenName
                });
            }
        }
    );

    app.get('/logout',
        (req, res) => {
            req.logout();
            res.redirect(config.client_url);
        }
    );

    app.get('/return/google',
        passport.authenticate('google', { failureRedirect: '/' }),
        (req, res) => {
            res.redirect(config.client_url);
        }
    );

    app.get('/return/github',
        passport.authenticate('github', { failureRedirect: '/' }),
        (req, res) => {
            res.redirect(config.client_url);
        }
    );

    app.post('/downloadZip',
        api.downloadZip);

    app.post('/microreactURL',
        api.microreactURL);

    app.post('/downloadGraphml',
        api.downloadGraphml);

    app.post('/project/:projectId/amr/:sampleHash',
        authCheck,
        api.postAMR)
})

export const apiEndpoints = (config => ({

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
                sendError(response, error);
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
                sendError(response, error);
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
                sendError(response, error);
            });
    },

    async getVersionInfo(request, response) {
        await axios.get(`${config.api_url}/version`)
            .then(res => response.send(res.data));
    },

    async newProject(request, response) {
        const name = (request.body as NewProjectRequest).name;
        const {redis} = request.app.locals;
        const projectId = await userStore(redis).saveNewProject(request, name);
        sendSuccess(response, projectId);
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
                    sendError(response, error);
                })
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
    },

    async getProjects(request, response, next) {
        await asyncHandler(next, async () => {
            const {redis} = request.app.locals;
            const projects = await userStore(redis).getUserProjects(request);
            sendSuccess(response, projects);
        });
    },

    async getProject(request, response, next) {
        await asyncHandler(next, async () => {
            const {projectId} = request.params;
            const {redis} = request.app.locals;
            const store = userStore(redis);
            const projectHash = await store.getProjectHash(request, projectId);
            await axios.get<ProjectResponse>(`${config.api_url}/project/${projectHash}`)
                .then(async res => {
                    // Get each project sample (a combination of sample hash and filename) from redis and find the
                    // corresponding sample (by hash) in the response from beebop_py api (containing cluster info etc) -
                    // combine data from both in response to client
                    const projectSamples = await store.getProjectSamples(projectId);
                    const responseSamples = [];
                    await Promise.all(projectSamples.map(async (sample) => {
                        const apiSample = res.data.samples.find(s => s.hash === sample.hash);
                        const amr = await store.getAMR(projectId, sample.hash, sample.fileName);
                        responseSamples.push({
                            ...apiSample,  //TODO: take dummy amr & filename out of beebop_py - this will overwrite though, so can be done separately
                            filename: sample.fileName,
                            amr
                        });
                    }));
                    res.data.samples = responseSamples;
                    response.send(res.data);
                })
                .catch(function (error) {
                    sendError(response, error);
                });
        });
    },

    async getStatus(request, response) {
        await axios.get(`${config.api_url}/status/${request.body.hash}`)
            .then(res => response.send(res.data))
            .catch(function (error) {
                sendError(response, error);
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
                sendError(response, error);
            });
    }
}));

const authCheck = (req, res, next) => {
    if (!req.user) {
        res.json(
            {
                status:"failure",
                errors:["not authenticated"],
                data: null
            }
        );
    } else {
        next();
    }
}

function sendError(response, error) {
    if (error.response) {
        response.status(500).send(
            {
                status:"failure",
                errors:[{error: error.response.data.error.errors[0].error, detail: error.response.data.error.errors[0].detail}],
                data: null
            })  
    } else {
      response.status(500).send(
        {
            status:"failure",
            errors:[{error: 'Could not connect to API', detail: error}],
            data: null
        })  
    }
}

function sendSuccess(response, data) {
    response.json({
        status: 'success',
        errors: [],
        data
    });
}