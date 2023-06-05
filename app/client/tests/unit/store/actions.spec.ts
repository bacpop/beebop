import actions from "@/store/actions";
import versionInfo from "@/resources/versionInfo.json";
import { Md5 } from "ts-md5/dist/md5";
import { BeebopError } from "@/types";
import { emptyState } from "@/utils";
import config from "../../../src/settings/development/config";
import {mockAxios, mockFailure, mockRootState, mockSuccess} from "../../mocks";
import mock = jest.mock;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function responseSuccess(data : any) {
    return {
        status: "success",
        errors: [],
        data
    };
}

function responseError(error: BeebopError) {
    return {
        status: "failure",
        errors: [error],
        data: null
    };
}

let mockWorkerResultType = "sketch";
class MockWorker implements Partial<Worker> {
  url: string

  onmessage: (msg: any) => any

  constructor(stringUrl: any) {
      this.url = stringUrl;
      this.onmessage = () => {};
  }

  postMessage(msg: any) {
      this.onmessage({
          data: {
              ...msg,
              type: mockWorkerResultType
          }
      });
  }
}

(window as any).Worker = MockWorker;

describe("Actions", () => {
    afterEach(() => {
        mockAxios.reset();
        jest.clearAllMocks();
    });

    const serverUrl = config.serverUrl();
    it("getVersions fetches and commits version info", async () => {
        mockAxios.onGet(`${serverUrl}/version`).reply(200, versionInfo);
        const commit = jest.fn();
        await actions.getVersions({ commit } as any);

        expect(commit).toHaveBeenCalledWith(
            "setVersions",
            versionInfo.data
        );
    });

    it("getUser fetches and commits user info", async () => {
        mockAxios.onGet(`${serverUrl}/user`)
            .reply(200, responseSuccess({ id: "12345", name: "Beebop", provider: "google" }));
        const commit = jest.fn();
        await actions.getUser({ commit } as any);

        expect(commit).toHaveBeenCalledWith(
            "setUser",
            { id: "12345", name: "Beebop", provider: "google" }
        );
    });

    it("newProject clears state, posts project name and commits returned id", async () => {
        mockAxios.onPost(`${serverUrl}/project`)
            .reply(200, responseSuccess("ABC-123"));
        const commit = jest.fn();
        const state = {
            ...emptyState(),
            projectId: "123",
            projectHash: "abc",
            errors: ["test error"],
            submitStatus: "test status"
        } as any;
        await actions.newProject({ commit, state } as any, "testproj");
        expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual({ name: "testproj" });
        expect(state).toStrictEqual(emptyState());
        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe("setProjectName");
        expect(commit.mock.calls[0][1]).toBe("testproj");
        expect(commit.mock.calls[1][0]).toBe("setProjectId");
        expect(commit.mock.calls[1][1]).toBe("ABC-123");
    });

    it("newProject adds error response", async () => {
        const error = { error: "test", detail: "test detail" };
        mockAxios.onPost(`${serverUrl}/project`)
            .reply(500, responseError(error));
        const commit = jest.fn();
        const state = emptyState();
        await actions.newProject({ commit, state } as any, "testproj");
        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe("setProjectName");
        expect(commit.mock.calls[0][1]).toBe("testproj");
        expect(commit.mock.calls[1][0]).toBe("addError");
        expect(commit.mock.calls[1][1]).toStrictEqual(error);
    });

    it("logoutUser makes axios call", async () => {
        mockAxios.onGet(`${serverUrl}/logout`).reply(200);
        await actions.logoutUser();
        expect(mockAxios.history.get[0].url).toEqual(`${serverUrl}/logout`);
    });

    it("processFiles calculates filehash, adds hash & filename to store and calls setSketch", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const file = {
            name: "sample.fa",
            text: () => Promise.resolve("ACGTGTAGTCTGACGTAAC")
        };
        mockWorkerResultType = "sketch";
        await actions.processFiles({ commit } as any, [file as any]);
        expect(commit.mock.calls[0]).toEqual([
            "addFile",
            { hash: "97f83117a2679651d4044b5ffdc5fd00", name: "sample.fa" }]);
        expect(commit.mock.calls[1]).toEqual([
            "setIsolateValue",
            { hash: "97f83117a2679651d4044b5ffdc5fd00", fileObject: file, type: "sketch" }]);

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("processFiles persists AMR when worker result type is amr", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const file = {
            name: "sample.fa",
            text: () => Promise.resolve("ACGTGTAGTCTGACGTAAC")
        };
        mockWorkerResultType = "amr";
        await actions.processFiles({ commit, dispatch } as any, [file as any]);
        expect(commit).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe("postAMR");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({
            fileObject: file,
            hash: "97f83117a2679651d4044b5ffdc5fd00",
            type: "amr"
        });
    });

    it("runPoppunk makes axios call", async () => {
        const commit = jest.fn();
        const state = mockRootState({
            projectId: "test-project",
            results: {
                perIsolate: {
                    someFileHash: {
                        filename: "someFilename",
                        sketch: '{"14":"12345"}'
                    },
                    someFileHash2: {
                        filename: "someFilename2",
                        sketch: '{"14":"12345"}'
                    }
                },
                perCluster: {}
            }
        });
        const expectedHash = Md5.hashStr("someFileHashsomeFilenamesomeFileHash2someFilename2");
        mockAxios.onPost(`${serverUrl}/poppunk`).reply(200, responseSuccess({
            assign: "job-id", microreact: "job-id", network: "job-id"
        }));
        await actions.runPoppunk({ commit, state } as any);
        expect(mockAxios.history.post[0].url).toEqual(`${serverUrl}/poppunk`);
        expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual({
            projectHash: expectedHash,
            projectId: "test-project",
            sketches: {
                someFileHash: { 14: "12345" },
                someFileHash2: { 14: "12345" }
            },
            names: {
                someFileHash: "someFilename",
                someFileHash2: "someFilename2"
            }
        });
        expect(commit.mock.calls[0]).toEqual([
            "setProjectHash",
            expectedHash]);
        expect(commit.mock.calls[1]).toEqual([
            "setAnalysisStatus",
            {
                assign: "submitted",
                microreact: "submitted",
                network: "submitted"
            }]);
    });

    it("getStatus makes axios call and updates analysisStatus, triggers getAssignResult", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash",
            submitStatus: "submitted",
            analysisStatus: {
                assign: "started",
                microreact: "waiting",
                network: "waiting"
            }
        });
        mockAxios.onPost(`${serverUrl}/status`).reply(200, responseSuccess({
            assign: "finished", microreact: "started", network: "queued"
        }));
        await actions.getStatus({ commit, state, dispatch } as any);
        expect(mockAxios.history.post[0].url).toEqual(`${serverUrl}/status`);
        expect(commit.mock.calls[0]).toEqual([
            "setAnalysisStatus",
            {
                microreact: "started",
                network: "queued",
                assign: "finished"
            }
        ]);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith("getAssignResult");
    });

    it("getStatus stops updating analysisStatus once all jobs finished", async () => {
        jest.useFakeTimers();
        jest.spyOn(global, "clearInterval");
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash",
            submitStatus: "submitted",
            analysisStatus: {
                assign: "finished",
                microreact: "started",
                network: "queued"
            },
            statusInterval: 202
        });
        mockAxios.onPost(`${serverUrl}/status`).reply(200, responseSuccess({
            assign: "finished", microreact: "finished", network: "finished"
        }));
        await actions.getStatus({ commit, state, dispatch } as any);
        expect(clearInterval).toHaveBeenCalledTimes(1);
        expect(clearInterval).toHaveBeenLastCalledWith(202);
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it("getStatus stops updating analysisStatus when jobs fail", async () => {
        jest.useFakeTimers();
        jest.spyOn(global, "clearInterval");
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash",
            submitStatus: "submitted",
            analysisStatus: {
                assign: "finished",
                microreact: "started",
                network: "queued"
            },
            statusInterval: 202
        });
        mockAxios.onPost(`${serverUrl}/status`).reply(200, responseSuccess({
            assign: "finished", microreact: "failed", network: "failed"
        }));
        await actions.getStatus({ commit, state, dispatch } as any);
        expect(clearInterval).toHaveBeenCalledTimes(1);
        expect(clearInterval).toHaveBeenLastCalledWith(202);
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it("getStatus stops updating analysisStatus when it receives no results from API", async () => {
        jest.useFakeTimers();
        jest.spyOn(global, "clearInterval");
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash",
            submitStatus: "submitted",
            analysisStatus: {
                assign: "submitted",
                microreact: "submitted",
                network: "submitted"
            },
            statusInterval: 202
        });
        mockAxios.onPost(`${serverUrl}/status`).reply(400);
        await actions.getStatus({ commit, state, dispatch } as any);
        expect(clearInterval).toHaveBeenCalledTimes(1);
        expect(clearInterval).toHaveBeenLastCalledWith(202);
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it("startStatusPolling sets statusInterval", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        await actions.startStatusPolling({ commit, dispatch } as any);
        expect(commit.mock.calls[0][0]).toEqual("setStatusInterval");
        expect(commit.mock.calls[0][1]).toEqual(expect.any(Number));
    });

    it("getAssignResult makes axios call and updates clusters", async () => {
        const commit = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash",
            results: {
                perIsolate: {
                    someFileHash: {
                        hash: "someFileHash"
                    },
                    someFileHash2: {
                        hash: "someFileHash2"
                    }
                },
                perCluster: {}
            }
        });
        const expResponse = responseSuccess({
            0: { hash: "someFileHash", cluster: "12" },
            1: { hash: "someFileHash2", cluster: "2" }
        });
        mockAxios.onPost(`${serverUrl}/assignResult`).reply(200, expResponse);
        await actions.getAssignResult({ commit, state } as any);
        expect(mockAxios.history.post[0].url).toEqual(`${serverUrl}/assignResult`);
        expect(commit.mock.calls[0]).toEqual([
            "setClusters",
            expResponse.data
        ]);
    });

    it("submitData triggers runPoppunk, startStatusPolling and sets submitStatus", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        await actions.submitData({ commit, dispatch } as any);
        expect(commit.mock.calls[0][0]).toEqual("setSubmitStatus");
        expect(commit.mock.calls[0][1]).toEqual("submitted");
        expect(dispatch.mock.calls[0][0]).toEqual("runPoppunk");
        expect(dispatch.mock.calls[1][0]).toEqual("startStatusPolling");
    });

    it("getZip makes api call and creates download link", async () => {
        const createElementSpy = jest.spyOn(document, "createElement");
        global.URL.createObjectURL = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash"
        });
        const data = {
            type: "network",
            cluster: 7
        };
        mockAxios.onPost(`${serverUrl}/downloadZip`).reply(200, { data: "zipData" });
        await actions.getZip({ state } as any, data);
        expect(createElementSpy).toHaveBeenCalledTimes(1);
        expect(createElementSpy).toHaveBeenCalledWith("a");
        expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
    });

    it("buildMicroreactURL makes axios call and updates results", async () => {
        const commit = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash"
        });
        const expResponse = responseSuccess({ cluster: 7, url: "microreact.org/mock" });
        mockAxios.onPost(`${serverUrl}/microreactURL`).reply(200, expResponse);
        await actions.buildMicroreactURL({ commit, state } as any, { cluster: 7, token: "some_token" });
        expect(mockAxios.history.post[0].url).toEqual(`${serverUrl}/microreactURL`);
        expect(commit.mock.calls[0]).toEqual([
            "setToken",
            "some_token"
        ]);
        expect(commit.mock.calls[1]).toEqual([
            "addMicroreactURL",
            expResponse.data
        ]);
    });

    it("getGraphml makes axios call and updates results", async () => {
        const commit = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash"
        });
        const expResponse = responseSuccess({ cluster: 7, graph: "<graph></graph>" });
        mockAxios.onPost(`${serverUrl}/downloadGraphml`).reply(200, expResponse);
        await actions.getGraphml({ commit, state } as any, 7);
        expect(mockAxios.history.post[0].url).toEqual(`${serverUrl}/downloadGraphml`);
        expect(commit.mock.calls[0]).toEqual([
            "addGraphml",
            expResponse.data
        ]);
    });

    it("getSavedProjects fetches and commits user projects", async () => {
        const commit = jest.fn();
        const projects = [{ hash: "123", name: "proj 1" }, { hash: "456", name: "proj 2" }];
        mockAxios.onGet(`${serverUrl}/projects`).reply(200, responseSuccess(projects));
        await actions.getSavedProjects({ commit } as any);
        expect(mockAxios.history.get[0].url).toEqual(`${serverUrl}/projects`);
        expect(commit.mock.calls[0]).toEqual([
            "setSavedProjects",
            projects
        ]);
    });

    it("getSavedProjects commits error", async () => {
        const commit = jest.fn();
        mockAxios.onGet(`${serverUrl}/projects`).reply(500, responseError({ error: "test error" }));
        await actions.getSavedProjects({ commit } as any);
        expect(mockAxios.history.get[0].url).toEqual(`${serverUrl}/projects`);
        expect(commit.mock.calls[0]).toEqual([
            "addError",
            { error: "test error" }
        ]);
    });

    it("loadProject", async () => {
        const commit = jest.fn();
        const state = mockRootState();
        const savedProject = { hash: "123", id: "abc", name: "test project" };
        const projectResponse = { test: "value" };
        const url = `${serverUrl}/project/123`;
        mockAxios.onGet(url).reply(200, responseSuccess(projectResponse));
        await actions.loadProject({ commit, state } as any, savedProject);
        expect(mockAxios.history.get[0].url).toEqual(url);
        expect(commit.mock.calls.length).toBe(6);
        expect(commit.mock.calls[0][0]).toBe("setLoadingProject");
        expect(commit.mock.calls[0][1]).toBe(true);
        expect(commit.mock.calls[1][0]).toBe("addLoadingProjectMessage");
        expect(commit.mock.calls[1][1]).toBe("Clearing state");
        expect(commit.mock.calls[2][0]).toBe("addLoadingProjectMessage");
        expect(commit.mock.calls[2][1]).toBe("Fetching sketches");
        expect(commit.mock.calls[3][0]).toBe("projectLoaded");
        expect(commit.mock.calls[3][1]).toStrictEqual(projectResponse);
        expect(commit.mock.calls[4][0]).toBe("addLoadingProjectMessage");
        expect(commit.mock.calls[4][1]).toBe("Loading complete");
        expect(commit.mock.calls[5][0]).toBe("setLoadingProject");
        expect(commit.mock.calls[5][1]).toBe(false);
    });

    it("loadProject commits error on error response", async () => {
        const commit = jest.fn();
        const state = mockRootState();
        const savedProject = { hash: "123", id: "abc", name: "test project" };
        const projectResponse = { test: "value" };
        const url = `${serverUrl}/project/123`;
        mockAxios.onGet(url).reply(500, responseError({ error: "test error" }));
        await actions.loadProject({ commit, state } as any, savedProject);
        expect(mockAxios.history.get[0].url).toEqual(url);
        expect(commit.mock.calls.length).toBe(6);
        expect(commit.mock.calls[0][0]).toBe("setLoadingProject");
        expect(commit.mock.calls[0][1]).toBe(true);
        expect(commit.mock.calls[1][0]).toBe("addLoadingProjectMessage");
        expect(commit.mock.calls[1][1]).toBe("Clearing state");
        expect(commit.mock.calls[2][0]).toBe("addLoadingProjectMessage");
        expect(commit.mock.calls[2][1]).toBe("Fetching sketches");
        expect(commit.mock.calls[3][0]).toBe("addError");
        expect(commit.mock.calls[3][1]).toStrictEqual({ error: "test error" });
        expect(commit.mock.calls[4][0]).toBe("addLoadingProjectMessage");
        expect(commit.mock.calls[4][1]).toBe("Loading complete");
        expect(commit.mock.calls[5][0]).toBe("setLoadingProject");
        expect(commit.mock.calls[5][1]).toBe(false);
    });

    it("postAMR posts amr data", async () => {
        const state = mockRootState({
            projectId: "testProjectId"
        });
        const commit = jest.fn();
        const amrData = {
            hash: "1234",
            result: JSON.stringify({
                Penicillin: 0.5
            })
        };
        const url = `${serverUrl}/project/testProjectId/amr/1234`;
        mockAxios.onPost(url).reply(200, mockSuccess(null));
        await actions.postAMR({ commit, state } as any, amrData);
        expect(mockAxios.history.post[0].url).toEqual(url);
        expect(mockAxios.history.post[0].data).toStrictEqual(amrData.result);
        expect(commit).not.toHaveBeenCalled();
    });

    it("postAMR commits error", async () => {
        const state = mockRootState({
            projectId: "testProjectId"
        });
        const commit = jest.fn();
        const amrData = {
            hash: "1234",
            result: JSON.stringify({
                Penicillin: 0.5
            })
        };
        const url = `${serverUrl}/project/testProjectId/amr/1234`;
        mockAxios.onPost(url).reply(500, mockFailure("TEST ERROR"));
        await actions.postAMR({ commit, state } as any, amrData);
        expect(commit.mock.calls[0]).toEqual([
            "addError",
            { error: "OTHER_ERROR", detail: "TEST ERROR" }
        ]);
    });
});
