import projectRoutes from "./projectRoutes";
import indexRoutes from "./indexRoutes";
import userRoutes from "./userRoutes";
import {Application} from "express";
import {BeebopConfig} from "../types/app";

export const router = ((app: Application, config: BeebopConfig) => {
    indexRoutes.addRoutes(app, config);
    projectRoutes.addRoutes(app, config);
    userRoutes.addRoutes(app, config);
});
