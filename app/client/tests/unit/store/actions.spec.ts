import actions from "@/store/actions";
import versionInfo from "@/resources/versionInfo.json";
import { Md5 } from "ts-md5/dist/md5";
import { BeebopError, ValueTypes } from "@/types";
import { emptyState } from "@/utils";
import config from "../../../src/settings/development/config";
import {
    mockAxios, mockFailure, mockRootState, mockSuccess
} from "../../mocks";

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

const failureResponse = mockFailure("TEST ERROR");
const expectFailureResponseCommitted = (commit: jest.Mock, idx = 0) => {
    expect(commit.mock.calls[idx]).toEqual([
        "addError",
        { error: "OTHER_ERROR", detail: "TEST ERROR" }
    ]);
};

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

    it("getUser fetches and commits user info and dispatches get Microreact token", async () => {
        mockAxios.onGet(`${serverUrl}/user`)
            .reply(200, responseSuccess({ id: "12345", name: "Beebop", provider: "google" }));
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = { microreactToken: null };
        await actions.getUser({ commit, dispatch, state } as any);

        expect(commit).toHaveBeenCalledWith(
            "setUser",
            { id: "12345", name: "Beebop", provider: "google" }
        );

        expect(dispatch).toHaveBeenCalledWith("getMicroreactToken");
    });

    it("getUser does not dispatch get Microreact token if token is already present", async () => {
        mockAxios.onGet(`${serverUrl}/user`)
            .reply(200, responseSuccess({ id: "12345", name: "Beebop", provider: "google" }));
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = { microreactToken: "abcd" };
        await actions.getUser({ commit, dispatch, state } as any);

        expect(commit).toHaveBeenCalledWith(
            "setUser",
            { id: "12345", name: "Beebop", provider: "google" }
        );
        expect(dispatch).not.toHaveBeenCalled();
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
            submitted: true
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

    it("renameProject makes axios calls and commits on success", async () => {
        const url = `${serverUrl}/project/testProjectId/rename`;
        mockAxios.onPost(url).reply(200, mockSuccess(null));
        const commit = jest.fn();
        const payload = { projectId: "testProjectId", name: "new name" };
        await actions.renameProject({ commit } as any, payload);
        expect(mockAxios.history.post[0].url).toBe(url);
        expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual({ name: "new name" });
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit).toHaveBeenCalledWith("projectRenamed", payload);
    });

    it("renameProject commits error", async () => {
        const url = `${serverUrl}/project/testProjectId/rename`;
        const error = { error: "test", detail: "test detail" };
        mockAxios.onPost(url).reply(500, responseError(error));
        const commit = jest.fn();
        const payload = { projectId: "testProjectId", name: "new name" };
        await actions.renameProject({ commit } as any, payload);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit).toHaveBeenCalledWith("addError", error);
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
            submitted: true,
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
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash",
            submitted: true,
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
        expect(dispatch).toHaveBeenCalledWith("stopStatusPolling");
    });

    it("getStatus stops updating analysisStatus when jobs fail", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash",
            submitted: true,
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
        expect(dispatch).toHaveBeenCalledWith("stopStatusPolling");
    });

    it("getStatus stops updating analysisStatus when it receives no results from API", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash",
            submitted: true,
            analysisStatus: {
                assign: "submitted",
                microreact: "submitted",
                network: "submitted"
            },
            statusInterval: 202
        });
        mockAxios.onPost(`${serverUrl}/status`).reply(400);
        await actions.getStatus({ commit, state, dispatch } as any);
        expect(dispatch).toHaveBeenCalledWith("stopStatusPolling");
    });

    it("stopStatusPolling clears interval", async () => {
        jest.useFakeTimers();
        jest.spyOn(global, "clearInterval");
        const state = mockRootState({
            statusInterval: 202
        });
        const commit = jest.fn();
        await actions.stopStatusPolling({ state, commit } as any);
        expect(clearInterval).toHaveBeenCalledTimes(1);
        expect(clearInterval).toHaveBeenLastCalledWith(202);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit).toHaveBeenCalledWith("setStatusInterval", undefined);
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it("stopStatusPolling does nothing if interval is not set", async () => {
        jest.useFakeTimers();
        jest.spyOn(global, "clearInterval");
        const state = mockRootState({
            statusInterval: undefined
        });
        await actions.stopStatusPolling({ state } as any);
        expect(clearInterval).not.toHaveBeenCalled();
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it("startStatusPolling sets statusInterval", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState();
        await actions.startStatusPolling({ commit, dispatch, state } as any);
        expect(commit.mock.calls[0][0]).toEqual("setStatusInterval");
        expect(commit.mock.calls[0][1]).toEqual(expect.any(Number));
    });

    it("startStatusPolling does nothing if statusInterval already set", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState({ statusInterval: 101 });
        await actions.startStatusPolling({ commit, dispatch, state } as any);
        expect(commit).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
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

    it("submitData triggers runPoppunk, startStatusPolling and sets submitted", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        await actions.submitData({ commit, dispatch } as any);
        expect(commit.mock.calls[0][0]).toEqual("setSubmitted");
        expect(commit.mock.calls[0][1]).toEqual(true);
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

    it("buildMicroreactURL makes axios call and updates results, and dispatches persist token", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash"
        });
        const expResponse = responseSuccess({ cluster: 7, url: "microreact.org/mock" });
        mockAxios.onPost(`${serverUrl}/microreactURL`).reply(200, expResponse);
        await actions.buildMicroreactURL({ commit, state, dispatch } as any, { cluster: 7, token: "some_token" });
        expect(mockAxios.history.post[0].url).toEqual(`${serverUrl}/microreactURL`);
        expect(commit.mock.calls[0]).toEqual([
            "setToken",
            "some_token"
        ]);
        expect(commit.mock.calls[1]).toEqual([
            "addMicroreactURL",
            expResponse.data
        ]);
        expect(dispatch).toHaveBeenCalledWith("persistMicroreactToken", "some_token");
    });

    it("buildMicroreacthURL does not commit or persist token if already present in state", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = mockRootState({
            projectHash: "randomHash",
            microreactToken: "some_token"
        });
        const expResponse = responseSuccess({ cluster: 7, url: "microreact.org/mock" });
        mockAxios.onPost(`${serverUrl}/microreactURL`).reply(200, expResponse);
        await actions.buildMicroreactURL({ commit, state, dispatch } as any, { cluster: 7, token: "some_token" });
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0]).toEqual([
            "addMicroreactURL",
            expResponse.data
        ]);
        expect(dispatch).not.toHaveBeenCalled();
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
        const dispatch = jest.fn();
        const state = mockRootState({
            // If we were using real mutations, this would be set by setLoading Project, but we're not, so initialise
            // it in the state
            analysisStatus: {
                assign: "finished",
                network: "finished",
                microreact: "waiting"
            }
        });
        const savedProject = {
            hash: "123",
            id: "abc",
            name: "test project",
            timestamp: 1687879927224,
            samplesCount: 2
        };
        const projectResponse = { test: "value" };
        const url = `${serverUrl}/project/abc`;
        mockAxios.onGet(url).reply(200, responseSuccess(projectResponse));
        await actions.loadProject({ commit, dispatch, state } as any, savedProject);
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
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe("startStatusPolling");
    });

    it("loadProject does not start status polling if project has completed run", async () => {
        const state = mockRootState();
        // We need to fake the setting of the status here because the action does an Object.assign to overwrite existing
        // state
        const commit = jest.fn().mockImplementation((name, payload) => {
            if (name === "projectLoaded") {
                state.analysisStatus = payload.status;
            }
        });
        const dispatch = jest.fn();
        const savedProject = {
            hash: "123",
            id: "abc",
            name: "test project",
            timestamp: 1687879927224,
            samplesCount: 3
        };
        const projectResponse = {
            status: {
                assign: "finished",
                network: "finished",
                microreact: "failed"
            }
        };
        const url = `${serverUrl}/project/abc`;
        mockAxios.onGet(url).reply(200, responseSuccess(projectResponse));
        await actions.loadProject({ commit, dispatch, state } as any, savedProject);
        expect(commit).toHaveBeenCalledTimes(6);
        expect(dispatch).not.toHaveBeenCalled();
    });

    it("loadProject commits error on error response", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const savedProject = {
            hash: "123",
            id: "abc",
            name: "test project",
            timestamp: 1687879927224,
            samplesCount: 3
        };
        const state = mockRootState({
            savedProjects: [savedProject]
        });
        const url = `${serverUrl}/project/abc`;
        mockAxios.onGet(url).reply(500, responseError({ error: "test error" }));
        await actions.loadProject({ commit, dispatch, state } as any, savedProject);
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
        expect(state.savedProjects).toStrictEqual([savedProject]);
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
            }),
            type: ValueTypes.AMR
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
            }),
            type: ValueTypes.AMR
        };
        const url = `${serverUrl}/project/testProjectId/amr/1234`;
        mockAxios.onPost(url).reply(500, failureResponse);
        await actions.postAMR({ commit, state } as any, amrData);
        expectFailureResponseCommitted(commit);
    });

    it("persistMicroreactToken posts token to api", async () => {
        const url = `${serverUrl}/microreactToken`;
        mockAxios.onPost(url).reply(200, mockSuccess(null));
        const commit = jest.fn();
        await actions.persistMicroreactToken({ commit } as any, "some_token");
        expect(mockAxios.history.post[0].url).toBe(url);
        expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual({ token: "some_token" });
        expect(commit).not.toHaveBeenCalled();
    });

    it("persistMicroreactToken commits error", async () => {
        const url = `${serverUrl}/microreactToken`;
        mockAxios.onPost(url).reply(500, failureResponse);
        const commit = jest.fn();
        await actions.persistMicroreactToken({ commit } as any, "some_token");
        expectFailureResponseCommitted(commit);
    });

    it("getMicroreactToken commits token response", async () => {
        const url = `${serverUrl}/microreactToken`;
        mockAxios.onGet(url).reply(200, mockSuccess("token_from_api"));
        const commit = jest.fn();
        await actions.getMicroreactToken({ commit } as any);
        expect(commit.mock.calls[0]).toEqual([
            "setToken",
            "token_from_api"
        ]);
    });

    it("getMicroreactToken commits error", async () => {
        const url = `${serverUrl}/microreactToken`;
        mockAxios.onGet(url).reply(500, failureResponse);
        const commit = jest.fn();
        await actions.getMicroreactToken({ commit } as any);
        expectFailureResponseCommitted(commit);
    });
});
