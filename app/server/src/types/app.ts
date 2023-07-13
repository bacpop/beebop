import {Application} from "express";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type BeebopConfig = Record<string, any>;
export interface BeebopRoutes {
    addRoutes: (app: Application, config: BeebopConfig) => void;
}