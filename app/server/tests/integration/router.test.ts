import request from 'supertest';
import Agent from'supertest';
import express from "express";
import axios from 'axios';
import passport from 'passport';
import MockAdapter from 'axios-mock-adapter';
import { router } from '../../src/routes/routes';
import { configureApp } from '../../src/configureApp';
import versionInfo from '../../../server/resources/versionInfo.json';
import config from '../../src/resources/config.json';
import MockStrategy from 'passport-mock-strategy';

const app = express();
configureApp(app, config);
router(app, config)

// adding passport mock strategy and route for tests
passport.use(new MockStrategy());
app.get('/login/mock', passport.authenticate('mock'), (req, res) => {
    res.send({ status: 'ok' });
    });

describe("testing-server-routes", () => {
    const mock = new MockAdapter(axios);
    mock.onGet(`${config.api_url}/version`).reply(200, versionInfo);

    it("GET /version", async () => {
        const response= await request(app).get("/version");
        expect(response.body).toMatchObject(versionInfo);
    });
    it("GET /", async () => {
        const { body } = await request(app).get("/");
        expect(body).toEqual({ message: 'Welcome to beebop!' });
    });
    it("GET /user", async () => {
        const { body } = await request(app).get("/user");
        expect(body.status).toEqual('failure');
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
        expect(body.data).toEqual({id:'1234', provider:'mock', name:'Foo'});
    });
});