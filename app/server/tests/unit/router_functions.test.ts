const { getVersionInfo, version_info } = require('../../../server/routes/routes');

const mockRequest = () => {};

const mockResponse = () => {
    const res = {};
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe("test routes", () => {
    it("get version info", async() => {
        const req = mockRequest();
        const res = mockResponse();
        await getVersionInfo(req,res);
        expect(res.send).toHaveBeenCalledWith(version_info)
    });
});