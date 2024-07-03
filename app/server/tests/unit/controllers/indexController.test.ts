const mockUserStoreConstructor = jest.fn();
const mockUserStore = {
  saveHashAndSampleHasRun: jest.fn(),
};
jest.mock("../../../src/db/userStore", () => ({
  userStore: mockUserStoreConstructor.mockReturnValue(mockUserStore),
}));

import { mockApp, mockRedis, mockResponse } from "../utils";
import config from "../../../src/resources/config.json";
import versionInfo from "../../../resources/versionInfo.json";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import indexController from "../../../src/controllers/indexController";

describe("indexController", () => {
  const mockRequest: any = {};

  const mockAxios = new MockAdapter(axios);
  mockAxios.onGet(`${config.api_url}/version`).reply(200, versionInfo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("get version info", async () => {
    const req = mockRequest;
    const res = mockResponse();
    await indexController(config).getVersionInfo(req, res);
    expect(res.send).toHaveBeenCalledWith(versionInfo);
  });

  it("sets hash & has run for samples for project and forwards request when run poppunk", async () => {
    const expectedPoppunkReq = {
      projectHash: "1234",
      names: {
        sample1: "file1.fasta",
        sample2: "file2.fasta",
      },
      sketches: {
        sample1: { 7: "abcd" },
        sample2: { 7: "efgh" },
      },
    };

    const req = {
      body: {
        ...expectedPoppunkReq,
        projectId: "test-project-id",
      },
      app: mockApp,
    };

    await indexController(config).runPoppunk(req, {}, jest.fn());
    expect(mockUserStoreConstructor).toHaveBeenCalledTimes(1);
    expect(mockUserStoreConstructor.mock.calls[0][0]).toBe(mockRedis);
    expect(mockUserStore.saveHashAndSampleHasRun).toHaveBeenCalledTimes(1);
    expect(mockUserStore.saveHashAndSampleHasRun.mock.calls[0][0]).toBe(req);
    expect(mockUserStore.saveHashAndSampleHasRun.mock.calls[0][1]).toBe(
      "test-project-id"
    );
    expect(mockUserStore.saveHashAndSampleHasRun.mock.calls[0][2]).toBe("1234");

    expect(mockAxios.history.post[0].url).toBe("http://localhost:5000/poppunk");
    expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual(
      expectedPoppunkReq
    );
  });

  it("should forward request to beebop_py api when getNetworkGraphs is called", async () => {
    const projectHash = "1234";
    const req = {
      params: {
        projectHash,
      },
    };
    const mockRes = mockResponse();
    mockAxios
      .onGet(`${config.api_url}/results/networkGraphs/${projectHash}`)
      .reply(200, { "1": "test-graph" });

    await indexController(config).getNetworkGraphs(req, mockRes);

    expect(mockAxios.history.get[1].url).toBe(
      `http://localhost:5000/results/networkGraphs/${projectHash}`
    );
    expect(mockRes.send).toHaveBeenCalledWith({ "1": "test-graph" });
  });
});
