import request from 'supertest';
import express from "express";
import { router } from '../../src/routes/routes';
import * as versionInfo from '../../../server/resources/versionInfo.json';

const app = express();

router(app)

describe("testing-server-routes", () => {
    it("GET /version", async () => {
        const { body } = await request(app).get("/version");
        expect(body).toEqual(versionInfo);
    });
    it("GET /", async () => {
        const { body } = await request(app).get("/");
        expect(body).toEqual({ message: 'Welcome to beebop!' });
    });
});