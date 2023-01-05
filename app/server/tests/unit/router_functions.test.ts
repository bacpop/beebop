const mockUserStoreConstructor = jest.fn();
const mockUserStore = {
    saveNewProject: jest.fn()
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
    return res;
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

    it("saves new project and forwards request when run poppunk", async () => {
        const mockRedis = {};
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
                projectName: "test project"
            },
            app: {
                locals: {
                    redis: mockRedis
                }
            }
        };

        await apiEndpoints(config).runPoppunk(req, {}, jest.fn());
        expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.saveNewProject).toHaveBeenCalledTimes(1);
        expect(mockUserStore.saveNewProject.mock.calls[0][0]).toBe(req);
        expect(mockUserStore.saveNewProject.mock.calls[0][1]).toBe("1234")
        expect(mockUserStore.saveNewProject.mock.calls[0][2]).toBe("test project");

        expect(mock.history.post[0].url).toBe("http://localhost:5000/poppunk");
        expect(JSON.parse(mock.history.post[0].data)).toStrictEqual(expectedPoppunkReq);
    });
});