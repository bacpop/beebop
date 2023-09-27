import {mockUserStoreConstructor, mockUserStore, mockEncryptedToken} from "../utils";
import {mockApp, mockRedis, mockResponse} from "../utils";
import config from "../../../src/resources/config.json";
import versionInfo from "../../../resources/versionInfo.json";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import indexController from "../../../src/controllers/indexController";
import encryption from "../../../src/encryption";

describe("indexController", () => {
    const mockRequest: any = { };

    const mockAxios = new MockAdapter(axios);
    mockAxios.onGet(`${config.api_url}/version`).reply(200, versionInfo);

    const mockEncrypted = Buffer.alloc(20, "test");
    const encryptSpy = jest.spyOn(encryption, "encrypt").mockReturnValue(mockEncrypted);
    const decryptSpy = jest.spyOn(encryption, "decrypt").mockReturnValue("decrypted");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("get version info", async () => {
        const req = mockRequest;
        const res = mockResponse();
        await indexController(config).getVersionInfo(req, res);
        expect(res.send).toHaveBeenCalledWith(versionInfo)
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

        await indexController(config).runPoppunk(req, {}, jest.fn());
        expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.saveProjectHash).toHaveBeenCalledTimes(1);
        expect(mockUserStore.saveProjectHash.mock.calls[0][0]).toBe(req);
        expect(mockUserStore.saveProjectHash.mock.calls[0][1]).toBe("test-project-id")
        expect(mockUserStore.saveProjectHash.mock.calls[0][2]).toBe("1234");

        expect(mockAxios.history.post[0].url).toBe("http://localhost:5000/poppunk");
        expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual(expectedPoppunkReq);
    });

    it("saves microreact token", async () => {
        const req = {
            body: {
                token: "1234"
            },
            app: mockApp
        };
        const res = mockResponse();
        await indexController(config).saveMicroreactToken(req, res);
        expect(encryptSpy).toHaveBeenCalledWith("1234", req);
        expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.saveEncryptedMicroreactToken).toHaveBeenCalledWith(req, mockEncrypted);
        expect(res.json).toHaveBeenCalledWith({status: "success", data: null, errors: []});
    });

    it("gets microreact token", async () => {
        const req = { app: mockApp };
        const res = mockResponse();
        await indexController(config).getMicroreactToken(req, res);
        expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
        expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
        expect(mockUserStore.getEncryptedMicroreactToken).toHaveBeenCalledWith(req);
        expect(decryptSpy).toHaveBeenCalledWith(mockEncryptedToken, req);
        expect(res.json).toHaveBeenCalledWith({status: "success", data: "decrypted", errors: []});
    });

    it("does not attempt to decrypt null microreact token", async () => {
        const req = { app: mockApp };
        const res = mockResponse();
        const oldMockGetEncryptedToken = mockUserStore.getEncryptedMicroreactToken;
        const emptyMockGetEncryptedToken = jest.fn().mockImplementation(() => null);
        mockUserStore.getEncryptedMicroreactToken = emptyMockGetEncryptedToken;
        await indexController(config).getMicroreactToken(req, res);
        mockUserStore.getEncryptedMicroreactToken = oldMockGetEncryptedToken;
        expect(emptyMockGetEncryptedToken).toHaveBeenCalledWith(req);
        expect(decryptSpy).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({status: "success", data: null, errors: []});
    });
});