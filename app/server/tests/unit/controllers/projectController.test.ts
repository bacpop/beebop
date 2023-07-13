const mockUserStoreConstructor = jest.fn();
const mockUserProjects = [{name: "p1", hash: "123"}];
const mockProjectSamples = [
    {hash: "5678", filename: "test1.fa"},
    {hash: "1234", filename: "test2.fa"},
    {hash: "1234", filename: "test3.fa"}
];
const mockUserStore = {
    saveNewProject: jest.fn().mockImplementation(() => "test-project-id"),
    getUserProjects: jest.fn().mockImplementation(() => mockUserProjects),
    getProjectHash: jest.fn().mockImplementation(() => "123"),
    saveAMR: jest.fn(),
    getProjectSamples: jest.fn().mockImplementation(() => mockProjectSamples),
    getAMR: jest.fn().mockImplementation((projectId: string, sampleHash: string, fileName: string) =>
        `AMR for ${projectId}-${sampleHash}-${fileName}`)
};
jest.mock("../../../src/db/userStore", () => ({
    userStore: mockUserStoreConstructor.mockReturnValue(mockUserStore)
}));

import {mockApp, mockRedis, mockResponse} from "../utils";
import config from "../../../src/resources/config.json";
import projectController from "../../../src/controllers/projectController";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mockAxios = new MockAdapter(axios);

describe("projectController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("saves new project", async () => {
        const req = {
            body: {
                name: "test project name"
            },
            app: mockApp
        };
        const res = mockResponse();
        await projectController(config).newProject(req, res);
        expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.saveNewProject).toHaveBeenCalledTimes(1);
        expect(mockUserStore.saveNewProject.mock.calls[0][0]).toBe(req);
        expect(mockUserStore.saveNewProject.mock.calls[0][1]).toBe("test project name");
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toStrictEqual({
            status: "success",
            errors: [],
            data: "test-project-id"
        });
    });

    it("gets projects for user", async () => {
        const req = {
            app: mockApp
        };
        const res = mockResponse();
        await projectController(config).getProjects(req, res, jest.fn());
        expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.getUserProjects).toHaveBeenCalledTimes(1);
        expect(mockUserStore.getUserProjects.mock.calls[0][0]).toBe(req);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toStrictEqual({
            status: "success",
            errors: [],
            data: mockUserProjects
        });
    });

    it("saved amr data", async () => {
        const req = {
            app: mockApp,
            body: {
                filename: "test.fa",
                Penicillin: 0.5
            },
            params: {
                projectId: "testProjectId",
                sampleHash: "1234"
            }
        };
        const res = mockResponse();
        await projectController(config).postAMR(req, res, jest.fn());
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.saveAMR).toHaveBeenCalledWith("testProjectId", "1234", req.body);
    });

    it("gets project", async () => {
        const req = {
            app: mockApp,
            params: {
                projectId: "testProjectId"
            }
        };
        const res = mockResponse();
        const projectData = {
            hash: "abcd",
            samples: [
                {hash: "1234", sketch: "AGTC"},
                {hash: "5678", sketch: "CTGA"}
            ]};

        mockAxios.onGet(`${config.api_url}/project/123`).reply(200, {data: projectData});

        await projectController(config).getProject(req, res, jest.fn());

        const response = res.json.mock.calls[0][0];
        expect(response).toStrictEqual({
            status: "success",
            errors: [],
            data: {
                hash: "abcd",
                samples: [
                    {hash: "5678", sketch: "CTGA", filename: "test1.fa", amr: "AMR for testProjectId-5678-test1.fa"},
                    {hash: "1234", sketch: "AGTC", filename: "test2.fa", amr: "AMR for testProjectId-1234-test2.fa"},
                    {hash: "1234", sketch: "AGTC", filename: "test3.fa", amr: "AMR for testProjectId-1234-test3.fa"}
                ]
            }
        });
        expect(mockUserStore.getProjectHash).toHaveBeenCalledWith(req, "testProjectId");
        expect(mockUserStore.getProjectSamples).toHaveBeenCalledWith("testProjectId");
    });

    it("getProject throws expected error when sample is missing in API response", async () => {
        const req = {
            app: mockApp,
            params: {
                projectId: "testProjectId"
            }
        };
        const res = mockResponse();
        const projectData = {
            hash: "abcd",
            samples: [
                {hash: "5678", sketch: "CTGA"}
            ]};

        mockAxios.onGet(`${config.api_url}/project/123`).reply(200, {data: projectData});
        const next = jest.fn();

        await projectController(config).getProject(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe("Sample with hash 1234 was not in API response");
    });

    it("getProject returns API error", async () => {
        const req = {
            app: mockApp,
            params: {
                projectId: "123"
            }
        };
        const res = mockResponse();
        const mockError = {
            error: {
                errors: [
                    {error: "PROJECT_ERROR", detail: "test project error"}
                ]
            }
        };
        mockAxios.onGet(`${config.api_url}/project/123`).reply(500, mockError);

        const next = jest.fn();
        await projectController(config).getProject(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: "failure",
            data: null,
            errors: [{error: "PROJECT_ERROR", detail: "test project error"}]
        });
    });
});