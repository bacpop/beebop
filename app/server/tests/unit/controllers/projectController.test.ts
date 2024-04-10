const mockUserStoreConstructor = jest.fn();
const mockUserProjects = [{name: "p1", hash: "123"}];
const getProjectSplitSampleIds = [
    {hash: "5678", filename: "test1.fa"},
    {hash: "1234", filename: "test2.fa"},
    {hash: "1234", filename: "test3.fa"}
];
const mockUserStore = {
    saveNewProject: jest.fn().mockImplementation(() => "test-project-id"),
    getUserProjects: jest.fn().mockImplementation(() => mockUserProjects),
    getProjectHash: jest.fn().mockImplementation(() => "123"),
    saveAMR: jest.fn(),
    saveSketch: jest.fn(),
    getProjectSplitSampleIds: jest.fn().mockImplementation(() => getProjectSplitSampleIds),
    getSketch: jest.fn().mockImplementation((projectId: string, sampleHash: string, fileName: string) =>
        ({ sketch: `sketch for ${projectId}-${sampleHash}-${fileName}` })),
    getAMR: jest.fn().mockImplementation((projectId: string, sampleHash: string, fileName: string) =>
        `AMR for ${projectId}-${sampleHash}-${fileName}`),
    renameProject: jest.fn(),
    deleteProject: jest.fn(),
    getBaseProjectInfo: jest.fn().mockImplementation(() => ({
        hash: "123",
        timestamp: 12321,
        name: "test project"
    })),
    getSample: jest.fn().mockImplementation(() => ({
        sketch: "test sketch",
        amr: "test amr"
    })),
    deleteSample: jest.fn(),
};
jest.mock("../../../src/db/userStore", () => ({
    userStore: mockUserStoreConstructor.mockReturnValue(mockUserStore)
}));
const mockProjectSampleData = [
    {hash: "1234", sketch: "AAAA", filename: "test1.fa", amr: "AMR for testProjectId-5678-test1.fa", cluster: 420 },
    {hash: "1235", sketch: "BBBB", filename: "test2.fa", amr: "AMR for testProjectId-1234-test2.fa", cluster: 421 },
    {hash: "1236", sketch: "CCCC", filename: "test3.fa", amr: "AMR for testProjectId-1234-test3.fa", cluster: 423 }
];
const mockGetResponseSamples = jest.fn(() => mockProjectSampleData); 
jest.mock("../../../src/utils/projectUtils", () => ({
    ProjectUtils: {
        getResponseSamples: () => mockGetResponseSamples()
    }
}));

import {mockApp, mockRedis, mockResponse} from "../utils";
import config from "../../../src/resources/config.json";
import projectController from "../../../src/controllers/projectController";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { BeebopError } from "../../../src/errors/beebopError";

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

    it("renames project", async() => {
        const req = {
            body: {
                name: "new name"
            },
            params: {
                projectId: "testProjectId"
            },
            app: mockApp
        };
        const res = mockResponse();
        await projectController(config).renameProject(req, res);
        expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.renameProject).toHaveBeenCalledWith(req, "testProjectId", "new name");
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toStrictEqual({
            status: "success",
            errors: [],
            data: null
        });
    });

    it("deletes project", async () => {
        const req = {
            app: mockApp,
            params: {
                projectId: "testProjectId"
            }
        };
        const res = mockResponse();
        await projectController(config).deleteProject(req, res, jest.fn());
        expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.deleteProject).toHaveBeenCalledWith(req, "testProjectId");
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toStrictEqual({
            status: "success",
            errors: [],
            data: null
        });
    })

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

    it("saves sketch data", async () => {
        const req = {
            body: {
                sketch: { key: "value" },
                filename: "test.fa"
            },
            params: {
                projectId: "testProjectId",
                sampleHash: "testSampleHash"
            },
            app: mockApp
        };
        const res = mockResponse();
        await projectController(config).postSketch(req, res, jest.fn());
        expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.saveSketch).toHaveBeenCalledTimes(1);
        expect(mockUserStore.saveSketch.mock.calls[0][0]).toBe(req.params.projectId);
        expect(mockUserStore.saveSketch.mock.calls[0][1]).toBe(req.params.sampleHash);
        expect(mockUserStore.saveSketch.mock.calls[0][2]).toBe(req.body.filename);
        expect(mockUserStore.saveSketch.mock.calls[0][3]).toBe(req.body.sketch);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toStrictEqual({
            status: "success",
            errors: [],
            data: null
        });
    });

    it("gets a ran project that has hash", async () => {
        const mockRunStatus = {
            assign: "finished",
            microreact: "started",
            network: "deffered"
        };
        const req = {
            app: mockApp,
            params: {
                projectId: "testProjectId"
            }
        };
        const res = mockResponse();
        const projectData = {
            hash: "123",
            samples: [
                {hash: "1234", sketch: "AAAA", cluster: 420},
                {hash: "1235", sketch: "BBBB", cluster: 421}
            ],
            status: mockRunStatus};

        mockAxios.onGet(`${config.api_url}/project/123`).reply(200, {data: projectData});

        await projectController(config).getProject(req, res, jest.fn());

        const response = res.json.mock.calls[0][0];
        expect(response).toStrictEqual({
            status: "success",
            errors: [],
            data: {
                hash: "123",
                samples: mockProjectSampleData,
                timestamp: 12321,
                name: "test project",
                id: "testProjectId",
                status: mockRunStatus
            }
        });
    });
    
    it("gets an unrun project with no hash and does not include api data from py", async () => {
        mockUserStore.getBaseProjectInfo.mockReturnValueOnce({hash: null, timestamp: 1111111, name: "test project"})
        const req = {
            app: mockApp,
            params: {
                projectId: "testProjectId"
            }
        };
        const res = mockResponse();
        
        await projectController(config).getProject(req, res, jest.fn());
        const projectData = {
            hash: "abcd",
            samples: [
                {hash: "1234", sketch: "AAAA", cluster: 420},
                {hash: "1235", sketch: "BBBB", cluster: 421}
            ],
        status: {assign: "finished", microreact: "started", network: "deffered"}};
        mockAxios.onGet(`${config.api_url}/project/123`).reply(200, {data: projectData});

        const response = res.json.mock.calls[0][0];

        // does not include api data from beebop py 
        expect(response).toStrictEqual({
            status: "success",
            errors: [],
            data: {
                hash: null,
                samples: mockProjectSampleData,
                timestamp: 1111111,
                name: "test project",
                id: "testProjectId"
            }
        });
    });

    it("getProject throws expected error when getResponseSamples throws", async () => {
        mockGetResponseSamples.mockImplementationOnce(() => {
            throw new BeebopError(
                "Invalid data",
                `Sample with hash 1234 was not in API response`
              );
        });
        const req = {
            app: mockApp,
            params: {
                projectId: "testProjectId"
            }
        };
        const res = mockResponse();
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

    it("deleteSample calls userStore deleteSample with correct params", async () => {
        const req = {
            app: mockApp,
            params: {
                projectId: "testProjectId",
                sampleHash: "1234"
            },
            body: {
                filename: "test1.fa"
            }
        };

        await projectController(config).deleteSample(req, mockResponse(),jest.fn());

        expect(mockUserStore.deleteSample).toHaveBeenCalledTimes(1);
        expect(mockUserStore.deleteSample).toHaveBeenCalledWith("testProjectId", "1234", "test1.fa");
    })
});