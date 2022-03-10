const request = require('supertest');
const express = require('express');
const { router, version_info } = require('../../../server/routes/routes');

const app = express();

router(app)

describe("testing-server-routes", () => {
    it("GET /version", async () => {
        const { body } = await request(app).get("/version");
        expect(body).toEqual(version_info);
    });
    it("GET /", async () => {
        const { body } = await request(app).get("/");
        expect(body).toEqual({ message: 'Welcome to beebop!' });
    });
});