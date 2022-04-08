import request from 'supertest';
import express from "express";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { router } from '../../src/routes/routes';
import versionInfo from '../../../server/resources/versionInfo.json';
import config from '../../src/resources/config.json';

const app = express();

router(app)

describe("testing-server-routes", () => {
    const mock = new MockAdapter(axios);
    mock.onGet(`${config.api_url}/version`).reply(200, versionInfo);

    it("GET /version", async () => {
        const response= await request(app).get("/version");
        console.log(versionInfo)
        expect(response.body).toMatchObject(versionInfo);
    });
    it("GET /", async () => {
        const { body } = await request(app).get("/");
        expect(body).toEqual({ message: 'Welcome to beebop!' });
    });
});