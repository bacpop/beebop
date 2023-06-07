const mockUserStoreConstructor = jest.fn();
const mockUserProjects = [{name: "p1", hash: "123"}];
const mockProjectSamples = [
    {hash: "5678", fileName: "test1.fa"},
    {hash: "1234", fileName: "test2.fa"},
    {hash: "1234", fileName: "test3.fa"}
];
const mockUserStore = {
    saveNewProject: jest.fn().mockImplementation(() => "test-project-id"),
    getUserProjects: jest.fn().mockImplementation(() => mockUserProjects),
    saveProjectHash: jest.fn(),
    getProjectHash: jest.fn().mockImplementation(() => "123"),
    saveAMR: jest.fn(),
    getProjectSamples: jest.fn().mockImplementation(() => mockProjectSamples),
    getAMR: jest.fn().mockImplementation((projectId: string, sampleHash: string, fileName: string) =>
        `AMR for ${projectId}-${sampleHash}-${fileName}`)
};
jest.mock("../../src/db/userStore", () => ({
    userStore: mockUserStoreConstructor.mockReturnValue(mockUserStore)
}))

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {apiEndpoints} from '../../src/routes/routes';
import versionInfo from '../../../server/resources/versionInfo.json';
import config from '../../src/resources/config.json';

const mockRequest: any = { };

const mockResponse = () => {
    const res: any = {};
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

const mockRedis = {};

const mockApp = {
    locals: {
        redis: mockRedis
    }
};

describe("test routes", () => {
    const mockAxios = new MockAdapter(axios);
    mockAxios.onGet(`${config.api_url}/version`).reply(200, versionInfo);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("get version info", async () => {
        const req = mockRequest;
        const res = mockResponse();
        await apiEndpoints(config).getVersionInfo(req, res);
        expect(res.send).toHaveBeenCalledWith(versionInfo)
    });

    it("saves new project", async () => {
        const req = {
            body: {
                name: "test project name"
            },
            app: mockApp
        };
        const res = mockResponse();
        await apiEndpoints(config).newProject(req, res);
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

    it("sets hash for project and forwards request when run poppunk", async () => {
        const expectedPoppunkReq = {
            projectHash: "1234",
            names: {
                sample1: "file1.fasta",
                sample2: "file2.fasta"
            },
            sketches: {
                sample1: {7: "abcd"},
                sample2: {7: "efgh"}
            }
        };

        const req = {
            body: {
               ...expectedPoppunkReq,
                projectId: "test-project-id"
            },
            app: mockApp
        };

        await apiEndpoints(config).runPoppunk(req, {}, jest.fn());
        expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.saveProjectHash).toHaveBeenCalledTimes(1);
        expect(mockUserStore.saveProjectHash.mock.calls[0][0]).toBe(req);
        expect(mockUserStore.saveProjectHash.mock.calls[0][1]).toBe("test-project-id")
        expect(mockUserStore.saveProjectHash.mock.calls[0][2]).toBe("1234");

        expect(mockAxios.history.post[0].url).toBe("http://localhost:5000/poppunk");
        expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual(expectedPoppunkReq);
    });

    it("gets projects for user", async () => {
        const req = {
            app: mockApp
        };
        const res = mockResponse();
        await apiEndpoints(config).getProjects(req, res, jest.fn());
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
        await apiEndpoints(config).postAMR(req, res, jest.fn());
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

        await apiEndpoints(config).getProject(req, res, jest.fn());

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

        await apiEndpoints(config).getProject(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe("Sample with hash 1234 was not in API response");
    });

    it("getProject returns API error", async () => {
        const req = {
            app: mockApp,
            params: {
                projectHash: "123"
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

        await apiEndpoints(config).getProject(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            status: "failure",
            errors: [{error: "PROJECT_ERROR", detail: "test project error"}],
            data: null
        });
    });
});