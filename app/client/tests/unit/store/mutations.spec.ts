import mutations from "@/store/mutations";
import { ValueTypes } from "@/types";
import { mockRootState } from "../../mocks";

describe("mutations", () => {
    it("adds Errors", () => {
        const state = mockRootState();
        const mockError = {
            error: "Error",
            detail: "Detail"
        };
        mutations.addError(state, mockError);
        expect(state.errors).toStrictEqual([mockError]);
    });
    it("sets versioninfo", () => {
        const state = mockRootState();
        const mockVersioninfo = {
            data: [{ name: "beebop", version: "0.1.0" }, { name: "poppunk", version: "2.4.0" }],
            errors: [],
            status: "success"
        };
        mutations.setVersions(state, mockVersioninfo);
        expect(state.versions).toBe(mockVersioninfo);
    });
    it("sets user", () => {
        const state = mockRootState();
        const mockUser = { id: "12345", provider: "google", name: "Jane" };
        mutations.setUser(state, mockUser);
        expect(state.user).toBe(mockUser);
    });
    it("adds new file", () => {
        const state = mockRootState();
        const mockFileMetadata = { hash: "someFileHash", name: "sampleName.fa" };
        mutations.addFile(state, mockFileMetadata);
        expect(state.results.perIsolate.someFileHash)
            .toStrictEqual({ hash: "someFileHash", filename: "sampleName.fa" });
    });
    it("sets sketch values", () => {
        const state = mockRootState({
            results: {
                perIsolate: {
                    someFileHash: {
                        hash: "someFileHash",
                        filename: "sampleName.fa"
                    }
                },
                perCluster: {}
            }
        });
        const { SKETCH } = ValueTypes;
        const mockIsolateValues = {
            hash: "someFileHash",
            type: SKETCH,
            result: "sketch_result"
        };
        mutations.setIsolateValue(state, mockIsolateValues);
        expect(state.results.perIsolate.someFileHash).toStrictEqual({
            hash: "someFileHash",
            filename: "sampleName.fa",
            sketch: "sketch_result"
        });
    });
    it("sets AMR values", () => {
        const state = mockRootState({
            results: {
                perIsolate: {
                    someFileHash: {
                        hash: "someFileHash",
                        filename: "sampleName.fa"
                    }
                },
                perCluster: {}
            }
        });
        const { AMR } = ValueTypes;
        const mockAMR = {
            hash: "someFileHash",
            type: AMR,
            result: '{ "Penicillin": 0.5, "Chloramphenicol": 0.2 }'
        };
        mutations.setIsolateValue(state, mockAMR);
        expect(state.results.perIsolate.someFileHash).toStrictEqual({
            hash: "someFileHash",
            filename: "sampleName.fa",
            amr: { Penicillin: 0.5, Chloramphenicol: 0.2 }
        });
    });
    it("sets submitStatus", () => {
        const state = mockRootState();
        mutations.setSubmitStatus(state, "submitted");
        expect(state.submitStatus).toBe("submitted");
    });
    it("sets analysisStatus", () => {
        const state = mockRootState();
        const statusUpdate = {
            assign: "finished",
            microreact: "started",
            network: "queued"
        };
        mutations.setAnalysisStatus(state, statusUpdate);
        expect(state.analysisStatus).toBe(statusUpdate);
    });
    it("sets projectHash", () => {
        const state = mockRootState();
        const phash = "mock-hash";
        mutations.setProjectHash(state, phash);
        expect(state.projectHash).toBe(phash);
    });
    it("sets statusInterval", () => {
        const state = mockRootState();
        const interval = 122;
        mutations.setStatusInterval(state, interval);
        expect(state.statusInterval).toBe(interval);
    });
    it("sets cluster", () => {
        const state = mockRootState({
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
        mutations.setClusters(
            state,
            { 0: { hash: "someFileHash", cluster: "12" }, 1: { hash: "someFileHash2", cluster: "2" } }
        );
        expect(state.results.perIsolate.someFileHash.cluster).toBe("12");
    });
    it("sets MicroreactURL", () => {
        const state = mockRootState();
        const mockURLInfo = {
            cluster: "7",
            url: "microreact.org/mock"
        };
        mutations.addMicroreactURL(state, mockURLInfo);
        expect(state.results.perCluster[mockURLInfo.cluster])
            .toStrictEqual({ cluster: "7", microreactURL: "microreact.org/mock" });
    });
    it("sets Microreact Token", () => {
        const state = mockRootState();
        mutations.setToken(state, "mock_microreact_token");
        expect(state.microreactToken).toBe("mock_microreact_token");
    });
    it("sets graph", () => {
        const state = mockRootState();
        const mockGraphInfo = {
            cluster: "7",
            graph: "<graph></graph>"
        };
        mutations.addGraphml(state, mockGraphInfo);
        expect(state.results.perCluster[mockGraphInfo.cluster])
            .toStrictEqual({ cluster: "7", graph: "<graph></graph>" });
    });
    it("sets project name", () => {
        const state = mockRootState();
        mutations.setProjectName(state, "test name");
        expect(state.projectName).toBe("test name");
    });
    it("sets project id", () => {
        const state = mockRootState();
        mutations.setProjectId(state, "ABC-123");
        expect(state.projectId).toBe("ABC-123");
    });
    it("sets saved projects", () => {
        const state = mockRootState();
        const projects = [{ hash: "123", name: "proj 1", id: "abc" }, { hash: "456", name: "proj 2", id: "def" }];
        mutations.setSavedProjects(state, projects);
        expect(state.savedProjects).toBe(projects);
    });
    it("sets loadingProject", () => {
        const state = mockRootState({
            loadingProjectMessages: ["msg1"]
        });
        mutations.setLoadingProject(state, true);
        expect(state.loadingProject).toBe(true);
        expect(state.loadingProjectMessages).toStrictEqual([]);
    });
    it("adds loading project message", () => {
        const state = mockRootState({
            loadingProjectMessages: ["msg1"]
        });
        mutations.addLoadingProjectMessage(state, "msg2");
        expect(state.loadingProjectMessages).toStrictEqual(["msg1", "msg2"]);
    });
    it("project loaded sets project values", () => {
        const state = mockRootState();
        const projectResponse = {
            hash: "testProjectHash",
            samples: [
                {
                    hash: "sample1",
                    filename: "sample1.fa",
                    amr: { Penicillin: 0.5 },
                    sketch: {
                        sketchValue: "testValue1"
                    }
                },
                {
                    hash: "sample2",
                    filename: "sample2.fa",
                    amr: { Penicillin: 0.6 },
                    sketch: {
                        sketchValue: "testValue2"
                    }
                }
            ]
        };
        mutations.projectLoaded(state, projectResponse as any);
        expect(state.results.perIsolate).toStrictEqual({
            sample1: {
                hash: "sample1",
                filename: "sample1.fa",
                amr: { Penicillin: 0.5 },
                sketch: "{\"sketchValue\":\"testValue1\"}"
            },
            sample2: {
                hash: "sample2",
                filename: "sample2.fa",
                amr: { Penicillin: 0.6 },
                sketch: "{\"sketchValue\":\"testValue2\"}"
            }
        });
    });
});
