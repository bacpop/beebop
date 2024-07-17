import {Application} from "express";
import {authCheck} from "../utils";
import projectController from "../controllers/projectController";
import {BeebopConfig, BeebopRoutes} from "../types/app";

export default {
    addRoutes(app: Application, config: BeebopConfig) {
        const controller = projectController(config);
        app.get('/projects',
            authCheck,
            controller.getProjects);
        app.post('/project',
            authCheck,
            controller.newProject);
        app.get('/project/:projectId',
            authCheck,
            controller.getProject);
        app.delete('/project/:projectId/delete',
            authCheck,
            controller.deleteProject);
        app.post('/project/:projectId/rename',
            authCheck,
            controller.renameProject);
        app.patch(`/project/:projectId/sample/:sampleHash/delete`,
            authCheck, 
            controller.deleteSample);
        app.post("/project/:projectId/sample", 
            authCheck,
            controller.addSamples);
    }
} as BeebopRoutes;