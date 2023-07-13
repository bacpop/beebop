import {Application} from "express";
import indexController from "../controllers/indexController";
import {BeebopConfig, BeebopRoutes} from "../types/app";
import {authCheck} from "../utils";

export default {
    addRoutes(app: Application, config: BeebopConfig) {
        const controller = indexController(config);
        app.get('/',
            (request, response) => {
                response.json({
                    message: 'Welcome to beebop!'
                });
            }
        );
        app.get('/version',
            controller.getVersionInfo);
        app.post('/poppunk',
            authCheck,
            controller.runPoppunk);
        app.post('/status',
            authCheck,
            controller.getStatus);
        app.post('/assignResult',
            authCheck,
            controller.getAssignResult);
        app.post('/downloadZip',
            controller.downloadZip);
        app.post('/microreactURL',
            controller.microreactURL);
        app.post('/downloadGraphml',
            controller.downloadGraphml);
    }
} as BeebopRoutes;