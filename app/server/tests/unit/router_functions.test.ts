const mockUserStoreConstructor = jest.fn();
const mockUserProjects = [{name: "p1", hash: "123"}];
const mockUserStore = {
    saveNewProject: jest.fn().mockImplementation(() => "test-project-id"),
    getUserProjects: jest.fn().mockImplementation(() => mockUserProjects),
    saveProjectHash: jest.fn()
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
    return res;
};

const mockRedis = {};

const mockApp = {
    locals: {
        redis: mockRedis
    }
};

describe("test routes", () => {
    const mock = new MockAdapter(axios);
    mock.onGet(`${config.api_url}/version`).reply(200, versionInfo);

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

        expect(mock.history.post[0].url).toBe("http://localhost:5000/poppunk");
        expect(JSON.parse(mock.history.post[0].data)).toStrictEqual(expectedPoppunkReq);
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
});