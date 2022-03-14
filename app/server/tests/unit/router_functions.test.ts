import { getVersionInfo } from '../../../server/routes/routes';
import * as versionInfo from '../../../server/resources/versionInfo.json';

const mockRequest = () => { }; // eslint-disable-line @typescript-eslint/no-empty-function

const mockResponse = () => {
    const res: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe("test routes", () => {
    it("get version info", async () => {
        const req = mockRequest();
        const res = mockResponse();
        await getVersionInfo(req, res);
        expect(res.send).toHaveBeenCalledWith(versionInfo)
    });
});