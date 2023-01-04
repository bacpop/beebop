import axios from 'axios';
import passport from 'passport';
import {PoppunkRequest} from "../requestTypes";
import {userStore} from "../db/userStore";
import asyncHandler from "../errors/asyncHandler";

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

    app.post('/poppunk',
        authCheck,
        api.runPoppunk);

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
                response.json({
                    status: 'success',
                    errors: [],
                    data: {
                        id: request.user.id,
                        provider: request.user.provider,
                        name: request.user.username
                    }
                    
                });
            } else {
                response.json({
                    status: 'success',
                    errors: [],
                    data: {
                        id: request.user.id,
                        provider: request.user.provider,
                        name: request.user.name.givenName
                    }    
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

    async runPoppunk(request, response, next) {
        await asyncHandler(next, async () => {
            const poppunkRequest = request.body as PoppunkRequest;
            const {projectHash, projectName} = poppunkRequest;
            console.log("Got project name " + projectName);
            const {redis} = request.app.locals;
            await userStore(redis).saveNewProject(request, projectHash, projectName);

            await axios.post(`${config.api_url}/poppunk`,
                request.body,
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
