import {Application} from "express";

export type BeebopConfig = Record<string, any>;
export interface BeebopRoutes {
    addRoutes: (app: Application, config: BeebopConfig) => void;
}