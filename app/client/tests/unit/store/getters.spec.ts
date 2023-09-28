import { getters } from "@/store/getters";
import { ProjectNameCheckResult } from "@/types";
import { mockRootState } from "../../mocks";

describe("getters", () => {
    it("calculates analysisProgress", () => {
        const state = mockRootState({
            projectHash: "randomHash",
            submitted: true,
            analysisStatus: {
                assign: "finished",
                microreact: "started",
                network: "queued"
            }
        });
        expect(getters.analysisProgress(state, "analysisProgress", state, "analysisProgress")).toStrictEqual({
            finished: 1,
            progress: 0.3333333333333333,
            total: 3
        });
    });
    it("gets unique clusters", () => {
        const state = mockRootState({
            results: {
                perCluster: {},
                perIsolate: {
                    hash1: {
                        cluster: 4
                    },
                    hash2: {
                        cluster: 2
                    },
                    hash3: {
                        cluster: 7
                    },
                    hash4: {
                        cluster: 4
                    },
                    hash5: {
                        cluster: 31
                    },
                    hash6: {
                        cluster: 2
                    }
                }
            }
        });
        expect(getters.uniqueClusters(
            state,
            "uniqueClusters",
            state,
            "uniqueClusters"
        )).toStrictEqual([2, 4, 7, 31]);
    });

    it("checkProjectName returns Empty", () => {
        const check = (getters.checkProjectName as any)(mockRootState());
        expect(check(" ")).toBe(ProjectNameCheckResult.Empty);
    });

    it("checkProjectName returns Unchanged", () => {
        const check = (getters.checkProjectName as any)(mockRootState());
        expect(check("project 1", "project 1")).toBe(ProjectNameCheckResult.Unchanged);
    });

    it("checkProjectName returns Duplicate", () => {
        const check = (getters.checkProjectName as any)(mockRootState({
            savedProjects: [
                { id: "1", name: "project 1" },
                { id: "2", name: "project 2" }
            ] as any
        }));
        expect(check("project 2", "project 3")).toBe(ProjectNameCheckResult.Duplicate);
    });

    it("checkProjectName returns OK", () => {
        const check = (getters.checkProjectName as any)(mockRootState({
            savedProjects: [
                { id: "1", name: "project 1" },
                { id: "2", name: "project 2" }
            ] as any
        }));
        expect(check("project 4", "project 3")).toBe(ProjectNameCheckResult.OK);
    });
});
