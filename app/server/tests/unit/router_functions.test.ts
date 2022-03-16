import { getVersionInfo } from '../../src/routes/routes';
import * as versionInfo from '../../../server/resources/versionInfo.json';

const mockRequest: any = { }; // eslint-disable-line @typescript-eslint/no-empty-function

const mockResponse = () => {
    const res: any = {};
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe("test routes", () => {
    it("get version info", async () => {
        const req = mockRequest;
        const res = mockResponse();
        await getVersionInfo(req, res);
        expect(res.send).toHaveBeenCalledWith(versionInfo)
    });
});