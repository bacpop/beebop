import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getVersionInfo } from '../../src/routes/routes';
import versionInfo from '../../../server/resources/versionInfo.json';
import config from '../../src/resources/config.enc.json';

const mockRequest: any = { };

const mockResponse = () => {
    const res: any = {};
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe("test routes", () => {
    const mock = new MockAdapter(axios);
    mock.onGet(`${config.api_url}/version`).reply(200, versionInfo);

    it("get version info", async () => {
        const req = mockRequest;
        const res = mockResponse();
        await getVersionInfo(req, res);
        expect(res.send).toHaveBeenCalledWith(versionInfo)
    });
});