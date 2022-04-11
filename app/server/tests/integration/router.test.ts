import request from 'supertest';
import Agent from'supertest';
import express from "express";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { router } from '../../src/routes/routes';
import { configApp } from '../../src/configApp';
import versionInfo from '../../../server/resources/versionInfo.json';
import config from '../../src/resources/config.json';


const app = express();
configApp(app)
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
    it("GET /user", async () => {
        const { body } = await request(app).get("/user");
        expect(body).toEqual(false);
    });
});

describe("testing-server-routes as logged in user", () => {
    let agent;
    beforeEach(() => {
        agent = Agent.agent(app);
      });

    it('should authenticate the user', () => {
        return agent.get('/login/mock').expect(200, { status: 'ok' });
    });

    it("GET /user", async () => {
        Agent.agent
        await agent.get('/login/mock');
        const { body } = await agent.get("/user");
        console.log(body)
        expect(body).toEqual({id:'1234', provider:'mock', name:'Foo'});
    });
});