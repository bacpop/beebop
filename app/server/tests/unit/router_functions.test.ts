const mockUserStoreConstructor = jest.fn();
const mockUserStore = {
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

    it("saves user hash when run poppunk", async () => {
        const mockRedis = {};
        const req = {
            body: {
                projectHash: "1234"
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
        expect(mockUserStore.saveProjectHash).toHaveBeenCalledTimes(1);
        expect(mockUserStore.saveProjectHash.mock.calls[0][0]).toBe(req);
        expect(mockUserStore.saveProjectHash.mock.calls[0][1]).toBe("1234");
    });
});